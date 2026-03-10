"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed as per previous steps
import { TabHelperCard } from "@/components/layout/tab-helper-card";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    archetype: string;
    createdAt: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setUsers(data);
        } catch (_err) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (userId: string, updates: Partial<User>) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!res.ok) throw new Error("Update failed");

            setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
            setEditingUser(null);
            toast.success("User updated successfully");
        } catch (_err) {
            toast.error("Failed to update user");
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                <Badge variant="outline">{users.length} Users</Badge>
            </div>

            <TabHelperCard
                summary="This tab lets admins manage users, roles, and archetype alignment from one screen."
                points={[
                    "Review all registered users and current access level.",
                    "Promote or adjust roles across candidate, learner, supervisor, and admin.",
                    "Assign archetypes for clearer learning path targeting.",
                ]}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Archetype</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.archetype}</TableCell>
                                <TableCell className="text-right">
                                    <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit User: {user.name}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Role</label>
                                                    <Select
                                                        value={editingUser?.id === user.id ? editingUser.role : user.role}
                                                        onValueChange={(val) => handleUpdate(user.id, { role: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="candidate">Candidate</SelectItem>
                                                            <SelectItem value="learner">Learner</SelectItem>
                                                            <SelectItem value="supervisor">Supervisor</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Archetype</label>
                                                    <Select
                                                        value={editingUser?.id === user.id ? (editingUser.archetype || "NONE") : (user.archetype || "NONE")}
                                                        onValueChange={(val) => handleUpdate(user.id, { archetype: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select archetype" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="NONE">None</SelectItem>
                                                            <SelectItem value="MAKER">Maker</SelectItem>
                                                            <SelectItem value="ARCHITECT">Architect</SelectItem>
                                                            <SelectItem value="REFINER">Refiner</SelectItem>
                                                            <SelectItem value="CATALYST">Catalyst</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
