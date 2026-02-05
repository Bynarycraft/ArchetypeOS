import { Link, useLocation } from 'react-router-dom';
 import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasRoleAccess } from '@/hooks/useRoleGuard';
import { cn } from '@/lib/utils';
import {
  Hexagon,
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Clock,
  Users,
  LogOut,
  GraduationCap,
  BarChart3,
  Map,
   ChevronLeft,
   ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
 import { ThemeToggle } from '@/components/ThemeToggle';
 import { useState } from 'react';
 import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: 'candidate' | 'learner' | 'supervisor' | 'admin';
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiredRole: 'learner' },
  { label: 'My Courses', href: '/courses', icon: BookOpen, requiredRole: 'learner' },
  { label: 'Roadmaps', href: '/roadmaps', icon: Map, requiredRole: 'learner' },
  { label: 'Tests', href: '/tests', icon: ClipboardCheck, requiredRole: 'learner' },
  { label: 'Learning Tracker', href: '/tracker', icon: Clock, requiredRole: 'learner' },
];

const supervisorItems: NavItem[] = [
  { label: 'My Learners', href: '/supervisor/learners', icon: Users, requiredRole: 'supervisor' },
  { label: 'Grading', href: '/supervisor/grading', icon: GraduationCap, requiredRole: 'supervisor' },
];

const adminItems: NavItem[] = [
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, requiredRole: 'admin' },
  { label: 'Manage Users', href: '/admin/users', icon: Users, requiredRole: 'admin' },
];

export function Sidebar() {
  const location = useLocation();
   const navigate = useNavigate();
  const { role, profile, signOut } = useAuth();
   const [collapsed, setCollapsed] = useState(false);

   const handleSignOut = async () => {
     await signOut();
     navigate('/auth');
   };
 
   const renderNavItems = (items: NavItem[], isCollapsed: boolean) => {
    return items
      .filter((item) => !item.requiredRole || hasRoleAccess(role, item.requiredRole))
      .map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

         const linkContent = (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
               'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                 ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                 : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
               isCollapsed && 'justify-center px-2'
            )}
          >
             <Icon className="h-5 w-5 shrink-0" />
             {!isCollapsed && <span>{item.label}</span>}
          </Link>
        );
 
         if (isCollapsed) {
           return (
             <Tooltip key={item.href}>
               <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
               <TooltipContent side="right" sideOffset={10}>
                 {item.label}
               </TooltipContent>
             </Tooltip>
           );
         }
 
         return linkContent;
      });
  };

  return (
     <aside
       className={cn(
         'bg-sidebar border-r border-sidebar-border flex flex-col h-screen transition-all duration-300',
         collapsed ? 'w-16' : 'w-64'
       )}
     >
      {/* Logo */}
       <div className={cn('p-4 flex items-center gap-3', collapsed && 'justify-center')}>
         <Hexagon className="h-8 w-8 text-sidebar-primary shrink-0" />
         {!collapsed && (
           <span className="text-lg font-bold text-sidebar-foreground">ArchetypeOS</span>
         )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
           {renderNavItems(navItems, collapsed)}
        </nav>

        {hasRoleAccess(role, 'supervisor') && (
          <>
             {!collapsed && (
               <div className="mt-6 mb-2 px-3">
                 <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                   Supervisor
                 </span>
               </div>
             )}
             {collapsed && <Separator className="my-4 bg-sidebar-border" />}
            <nav className="space-y-1">
               {renderNavItems(supervisorItems, collapsed)}
            </nav>
          </>
        )}

        {hasRoleAccess(role, 'admin') && (
          <>
             {!collapsed && (
               <div className="mt-6 mb-2 px-3">
                 <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                   Admin
                 </span>
               </div>
             )}
             {collapsed && <Separator className="my-4 bg-sidebar-border" />}
            <nav className="space-y-1">
               {renderNavItems(adminItems, collapsed)}
            </nav>
          </>
        )}
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      {/* User Section */}
       <div className={cn('p-4 space-y-3', collapsed && 'px-2')}>
         {/* Theme & Collapse Toggle */}
         <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
           {!collapsed && <ThemeToggle />}
           <Button
             variant="ghost"
             size="icon"
             className="h-9 w-9 text-sidebar-foreground/70 hover:bg-sidebar-accent"
             onClick={() => setCollapsed(!collapsed)}
           >
             {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
           </Button>
         </div>
 
         {/* User Info */}
         <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
           <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center shrink-0">
             <span className="text-sm font-medium text-white">
               {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
             </span>
          </div>
           {!collapsed && (
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-sidebar-foreground truncate">
                 {profile?.full_name || 'User'}
               </p>
               <p className="text-xs text-sidebar-foreground/50 capitalize">
                 {role || 'Loading...'}
               </p>
             </div>
           )}
        </div>

         {/* Sign Out Button */}
         {collapsed ? (
           <Tooltip>
             <TooltipTrigger asChild>
               <Button
                 variant="ghost"
                 size="icon"
                 className="w-full text-sidebar-foreground/70 hover:bg-sidebar-accent"
                 onClick={handleSignOut}
               >
                 <LogOut className="h-4 w-4" />
               </Button>
             </TooltipTrigger>
             <TooltipContent side="right" sideOffset={10}>
               Sign Out
             </TooltipContent>
           </Tooltip>
         ) : (
          <Button
            variant="ghost"
            size="sm"
             className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent"
             onClick={handleSignOut}
          >
             <LogOut className="h-4 w-4 mr-2" />
             Sign Out
          </Button>
         )}
      </div>
    </aside>
  );
}
