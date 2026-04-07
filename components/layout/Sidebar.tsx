import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { navConfig } from "@/config/nav";
import { ModeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, BookOpen, Users, BarChart3, Clock, Map, ClipboardList, ShieldCheck, Menu, Notebook, Brain, Award, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const iconMap = {
    LayoutDashboard,
    BookOpen,
    Users,
    BarChart3,
    Clock,
    Map,
    ClipboardList,
    ShieldCheck,
    Notebook,
    Brain,
    Award,
    MessageSquare,
    Bell,
};

import { SignOutButton } from "@/components/auth/sign-out-button";

type NavItem = { href: string; label: string; icon: string };
type NavSection = { title: string; items: NavItem[] };

export async function Sidebar() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role) {
        return null;
    }

    const items = navConfig[session.user.role as keyof typeof navConfig] || [];
    const roleHome: Record<string, string> = {
        candidate: "/candidate",
        learner: "/dashboard",
        supervisor: "/supervisor",
        admin: "/admin/dashboard",
    };
    const homeHref = roleHome[session.user.role] || "/dashboard";

    const navDescriptions: Record<string, string> = {
        "/dashboard": "Overview of current progress and activity.",
        "/roadmap": "Structured learning path by archetype.",
        "/courses": "Course catalog and learning materials.",
        "/tests": "All available assessments and attempts.",
        "/tracker": "Log study sessions and reflections.",
        "/supervisor": "Review submissions and grade learners.",
        "/admin/dashboard": "Organization-level admin overview.",
        "/admin/users": "Manage users, roles, and archetypes.",
        "/admin/courses": "Create and manage course content.",
        "/admin/analytics": "Review platform usage analytics.",
        "/admin/tests": "Create and manage assessment banks.",
        "/admin/skills": "Search and map organization skills.",
        "/admin/certificates": "Review and export issued certificates.",
        "/reflections": "Capture learning reflections and insights.",
        "/supervisor/reflections": "Review learner reflections and coach.",
        "/skills": "Explore skill gaps and strengths.",
        "/certificates": "View earned and available certificates.",
        "/results": "Review your assessment scores and feedback.",
        "/feedback": "Read and share performance feedback.",
        "/notifications": "Track system and learning updates.",
    };

    const buildSections = (role: string, navItems: NavItem[]): NavSection[] => {
        if (role === "admin") {
            return [
                { title: "Management", items: navItems.filter((i) => ["/admin/dashboard", "/admin/users", "/admin/courses", "/admin/tests", "/admin/analytics"].includes(i.href)) },
                { title: "Operations", items: navItems.filter((i) => ["/admin/skills", "/admin/certificates", "/supervisor"].includes(i.href)) },
            ].filter((section) => section.items.length > 0);
        }

        if (role === "supervisor") {
            return [
                { title: "Core", items: navItems.filter((i) => ["/dashboard", "/supervisor", "/roadmap", "/courses", "/tests", "/tracker"].includes(i.href)) },
                { title: "Coaching", items: navItems.filter((i) => ["/supervisor/reflections", "/skills", "/feedback", "/notifications", "/certificates"].includes(i.href)) },
            ].filter((section) => section.items.length > 0);
        }

        if (role === "learner") {
            return [
                { title: "Learn", items: navItems.filter((i) => ["/dashboard", "/roadmap", "/courses", "/tests", "/tracker"].includes(i.href)) },
                { title: "Growth", items: navItems.filter((i) => ["/reflections", "/skills", "/certificates", "/feedback", "/notifications"].includes(i.href)) },
            ].filter((section) => section.items.length > 0);
        }

        if (role === "candidate") {
            return [
                { title: "Core", items: navItems },
            ];
        }

        return [{ title: "Navigation", items: navItems }];
    };

    const sections = buildSections(session.user.role, items as NavItem[]);

    const renderNav = (closeOnNavigate = false) => (
        <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
            {sections.map((section) => (
                <div key={section.title} className="space-y-2">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/80">{section.title}</p>
                    <div className="space-y-1.5">
                        {section.items.map((item) => {
                            const Icon = iconMap[item.icon as keyof typeof iconMap];
                            if (closeOnNavigate) {
                                return (
                                    <SheetClose asChild key={item.href}>
                                        <Link
                                            href={item.href}
                                            title={navDescriptions[item.href] || item.label}
                                            className="group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold transition-all hover:bg-primary/10 hover:text-primary relative overflow-hidden active:scale-95"
                                        >
                                            <div className="relative z-10 p-2 rounded-xl bg-secondary/50 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-6">
                                                {Icon && <Icon className="h-4 w-4" />}
                                            </div>
                                            <div className="relative z-10 min-w-0">
                                                <div>{item.label}</div>
                                                <div className="text-[10px] font-medium text-muted-foreground truncate">{navDescriptions[item.href]}</div>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:to-primary/5 transition-all duration-500" />
                                        </Link>
                                    </SheetClose>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={navDescriptions[item.href] || item.label}
                                    className="group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold transition-all hover:bg-primary/10 hover:text-primary relative overflow-hidden active:scale-95"
                                >
                                    <div className="relative z-10 p-2 rounded-xl bg-secondary/50 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-6">
                                        {Icon && <Icon className="h-4 w-4" />}
                                    </div>
                                    <div className="relative z-10 min-w-0">
                                        <div>{item.label}</div>
                                        <div className="text-[10px] font-medium text-muted-foreground truncate">{navDescriptions[item.href]}</div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:to-primary/5 transition-all duration-500" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );

    return (
        <>
            <div className="hidden md:flex h-screen w-72 flex-col border-r border-border/40 bg-card/60 backdrop-blur-2xl text-card-foreground p-6 shadow-2xl shadow-primary/5">
                {/* Header */}
                <div className="flex items-center justify-between mb-10 px-2">
                    <Link href={homeHref} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-primary-foreground font-black text-xl">A</span>
                        </div>
                        <div className="leading-tight">
                            <div className="font-black tracking-tight">ArchetypeOS</div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Internal Talent Intelligence</div>
                        </div>
                    </Link>
                    <ModeToggle />
                </div>

                {/* Navigation */}
                {renderNav()}

                {/* Footer / User Profile */}
                <div className="mt-auto space-y-4">
                    <div className="p-1 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/10">
                        <div className="flex items-center justify-between gap-3 p-3 rounded-[calc(var(--radius)-4px)] bg-card/80 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-inner">
                            <Link href="/profile" className="flex items-center gap-3 overflow-hidden group/profile">
                                <div className="w-10 h-10 rounded-full bg-primary/20 shrink-0 flex items-center justify-center border-2 border-primary/20 group-hover/profile:border-primary/60 transition-all duration-300 overflow-hidden relative">
                                    <span className="text-primary font-black relative z-10">{session.user.name?.[0] || session.user.email?.[0]}</span>
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/profile:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex flex-col overflow-hidden text-xs">
                                    <span className="font-bold truncate group-hover/profile:text-primary transition-colors">{session.user.name || "User"}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-black text-[8px] tracking-tighter">
                                            {session.user.role}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:hidden sticky top-0 z-30 border-b border-border/40 bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
                <Link href={homeHref} className="font-black tracking-tight">ArchetypeOS</Link>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Sheet modal={false}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="Open navigation menu">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[88vw] p-5">
                            <SheetHeader>
                                <SheetTitle>Navigation</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 flex h-[calc(100%-3rem)] flex-col">
                                {renderNav(true)}
                                <div className="mt-4 border-t border-border/40 pt-4">
                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-card/80 p-3">
                                        <Link href="/profile" className="min-w-0 text-xs font-semibold text-muted-foreground">
                                            <span className="block truncate">{session.user.name || session.user.email}</span>
                                            <span className="text-[10px] uppercase tracking-wide">{session.user.role}</span>
                                        </Link>
                                        <SheetClose asChild>
                                            <SignOutButton showLabel className="text-destructive hover:text-destructive" />
                                        </SheetClose>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    );
}

export default Sidebar;
