 import { useEffect, useState } from 'react';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Input } from '@/components/ui/input';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { toast } from '@/hooks/use-toast';
 import { Users, Search, Shield, UserCheck, GraduationCap, User } from 'lucide-react';
 import { AppRole } from '@/lib/types';
 
 interface UserWithRole {
   id: string;
   email: string;
   full_name: string | null;
   archetype: string | null;
   created_at: string;
   role: AppRole;
 }
 
 const roleConfig: Record<AppRole, { label: string; icon: React.ElementType; color: string }> = {
   admin: { label: 'Admin', icon: Shield, color: 'bg-destructive/10 text-destructive border-destructive/20' },
   supervisor: { label: 'Supervisor', icon: UserCheck, color: 'bg-warning/10 text-warning border-warning/20' },
   learner: { label: 'Learner', icon: GraduationCap, color: 'bg-success/10 text-success border-success/20' },
   candidate: { label: 'Candidate', icon: User, color: 'bg-muted text-muted-foreground border-muted' },
 };
 
 export default function AdminUsers() {
   const [users, setUsers] = useState<UserWithRole[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState('');
   const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
   const [newRole, setNewRole] = useState<AppRole | ''>('');
   const [updating, setUpdating] = useState(false);
 
   useEffect(() => {
     fetchUsers();
   }, []);
 
   const fetchUsers = async () => {
     try {
       // Fetch all profiles
       const { data: profiles, error: profilesError } = await supabase
         .from('profiles')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (profilesError) throw profilesError;
 
       // Fetch all roles
       const { data: roles, error: rolesError } = await supabase
         .from('user_roles')
         .select('*');
 
       if (rolesError) throw rolesError;
 
       // Create a map of user_id to highest role
       const roleMap = new Map<string, AppRole>();
       roles?.forEach((r) => {
         const current = roleMap.get(r.user_id);
         const priority: Record<AppRole, number> = { admin: 4, supervisor: 3, learner: 2, candidate: 1 };
         if (!current || priority[r.role as AppRole] > priority[current]) {
           roleMap.set(r.user_id, r.role as AppRole);
         }
       });
 
       // Combine profiles with roles
       const usersWithRoles: UserWithRole[] = (profiles || []).map((p) => ({
         id: p.id,
         email: p.email,
         full_name: p.full_name,
         archetype: p.archetype,
         created_at: p.created_at,
         role: roleMap.get(p.id) || 'candidate',
       }));
 
       setUsers(usersWithRoles);
     } catch (error) {
       console.error('Error fetching users:', error);
       toast({
         title: 'Error',
         description: 'Failed to load users',
         variant: 'destructive',
       });
     } finally {
       setLoading(false);
     }
   };
 
   const handleRoleChange = async () => {
     if (!selectedUser || !newRole) return;
 
     setUpdating(true);
     try {
       // Delete existing roles for user
       const { error: deleteError } = await supabase
         .from('user_roles')
         .delete()
         .eq('user_id', selectedUser.id);
 
       if (deleteError) throw deleteError;
 
       // Insert new role
       const { error: insertError } = await supabase
         .from('user_roles')
         .insert({ user_id: selectedUser.id, role: newRole });
 
       if (insertError) throw insertError;
 
       // Update local state
       setUsers((prev) =>
         prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
       );
 
       toast({
         title: 'Role updated',
         description: `${selectedUser.full_name || selectedUser.email} is now a ${roleConfig[newRole].label}`,
       });
 
       setSelectedUser(null);
       setNewRole('');
     } catch (error) {
       console.error('Error updating role:', error);
       toast({
         title: 'Error',
         description: 'Failed to update role',
         variant: 'destructive',
       });
     } finally {
       setUpdating(false);
     }
   };
 
   const filteredUsers = users.filter(
     (user) =>
       user.email.toLowerCase().includes(search.toLowerCase()) ||
       (user.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
   );
 
   return (
     <MainLayout requiredRole="admin">
       <div className="space-y-6">
         <div>
           <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
           <p className="text-muted-foreground mt-1">
             View and manage user roles across the platform
           </p>
         </div>
 
         <Card>
           <CardHeader>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               <div>
                 <CardTitle className="flex items-center gap-2">
                   <Users className="h-5 w-5" />
                   All Users
                 </CardTitle>
                 <CardDescription>{users.length} total users</CardDescription>
               </div>
               <div className="relative w-full sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Search users..."
                   className="pl-10"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
               </div>
             </div>
           </CardHeader>
           <CardContent>
             {loading ? (
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                 ))}
               </div>
             ) : filteredUsers.length === 0 ? (
               <div className="text-center py-12 text-muted-foreground">
                 <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                 <p>No users found</p>
               </div>
             ) : (
               <div className="rounded-lg border overflow-hidden">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>User</TableHead>
                       <TableHead>Role</TableHead>
                       <TableHead>Archetype</TableHead>
                       <TableHead>Joined</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {filteredUsers.map((user) => {
                       const config = roleConfig[user.role];
                       const RoleIcon = config.icon;
 
                       return (
                         <TableRow key={user.id}>
                           <TableCell>
                             <div className="flex items-center gap-3">
                               <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                 <span className="text-sm font-medium text-primary">
                                   {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                 </span>
                               </div>
                               <div>
                                 <p className="font-medium">{user.full_name || 'Unnamed'}</p>
                                 <p className="text-sm text-muted-foreground">{user.email}</p>
                               </div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <Badge variant="outline" className={`gap-1 ${config.color}`}>
                               <RoleIcon className="h-3 w-3" />
                               {config.label}
                             </Badge>
                           </TableCell>
                           <TableCell>
                             {user.archetype ? (
                               <Badge variant="secondary">{user.archetype}</Badge>
                             ) : (
                               <span className="text-muted-foreground">—</span>
                             )}
                           </TableCell>
                           <TableCell className="text-muted-foreground">
                             {new Date(user.created_at).toLocaleDateString()}
                           </TableCell>
                           <TableCell className="text-right">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => {
                                 setSelectedUser(user);
                                 setNewRole(user.role);
                               }}
                             >
                               Change Role
                             </Button>
                           </TableCell>
                         </TableRow>
                       );
                     })}
                   </TableBody>
                 </Table>
               </div>
             )}
           </CardContent>
         </Card>
 
         {/* Role Change Dialog */}
         <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Change User Role</DialogTitle>
               <DialogDescription>
                 Update the role for {selectedUser?.full_name || selectedUser?.email}
               </DialogDescription>
             </DialogHeader>
             <div className="py-4">
               <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select a role" />
                 </SelectTrigger>
                 <SelectContent>
                   {(Object.keys(roleConfig) as AppRole[]).map((role) => {
                     const config = roleConfig[role];
                     const Icon = config.icon;
                     return (
                       <SelectItem key={role} value={role}>
                         <div className="flex items-center gap-2">
                           <Icon className="h-4 w-4" />
                           {config.label}
                         </div>
                       </SelectItem>
                     );
                   })}
                 </SelectContent>
               </Select>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setSelectedUser(null)}>
                 Cancel
               </Button>
               <Button onClick={handleRoleChange} disabled={updating || !newRole}>
                 {updating ? 'Updating...' : 'Save Changes'}
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       </div>
     </MainLayout>
   );
 }