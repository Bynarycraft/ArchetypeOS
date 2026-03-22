import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, UserCircle, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TabHelperCard } from "@/components/layout/tab-helper-card";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    type ProfileUser = Prisma.UserGetPayload<{
        include: {
            courseEnrollments: { include: { course: true } };
            dailyLearningSessions: true;
            testResults: true;
        };
    }>;

    let user: ProfileUser | null = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                courseEnrollments: { include: { course: true } },
                dailyLearningSessions: true,
                testResults: true,
            }
        });
    } catch (err) {
        console.error('[profile] prisma error:', err);
        return (
            <div className="p-12 text-center">
                <h2 className="text-2xl font-bold">Data currently unavailable</h2>
                <p className="mt-4 text-muted-foreground">We couldn&apos;t load your profile data right now, please try again later.</p>
            </div>
        );
    }

    if (!user) return <div>User not found</div>;

    const totalMinutes = user.dailyLearningSessions.reduce(
        (acc: number, s: { durationMinutes: number | null }) => acc + (s.durationMinutes || 0), 0
    );
    const totalHours = (totalMinutes / 60).toFixed(1);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="pb-4 border-b">
                <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your account information.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-12">
                    <TabHelperCard
                        summary="This tab centralizes account identity, role, archetype, and achievement details."
                        points={[
                            "Review account and archetype information.",
                            "Check progress indicators and validated assessments.",
                            "Use quick actions to continue learning from your profile.",
                        ]}
                    />
                </div>
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none bg-gradient-to-b from-primary/10 to-transparent shadow-2xl shadow-primary/5 rounded-[3rem] p-1 group">
                        <CardContent className="pt-12 bg-card/80 backdrop-blur-xl rounded-[calc(3rem-4px)] flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-20 invisible group-hover:visible transition-all">
                                <UserCircle className="h-20 w-20 text-primary" />
                            </div>
                            <div className="w-36 h-36 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border-4 border-white/5 mb-8 shadow-3xl relative group/avatar transition-transform cursor-pointer hover:rotate-3">
                                <span className="text-6xl font-black text-primary">{user.name?.[0] || user.email?.[0]}</span>
                                <div className="absolute inset-0 rounded-[2.5rem] bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-black uppercase tracking-widest">Update</span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter">{user.name || "User"}</h2>
                            <div className="flex flex-col items-center gap-3 mt-4">
                                <Badge className="bg-primary/20 text-primary border-none font-black tracking-widest px-4 py-1.5 uppercase text-[10px]">{user.role}</Badge>
                                <Badge className="bg-accent/20 text-accent border-none font-black tracking-widest px-4 py-1.5 uppercase text-[10px] shadow-lg shadow-accent/10">{user.archetype} ARCHEOTYPE</Badge>
                            </div>
                            <div className="mt-8 pb-8 w-full px-8">
                                <Link href="/tracker">
                                    <Button className="w-full font-black uppercase text-[10px] tracking-widest h-11 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">Open Learning Tracker</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                {/* Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                    <User className="h-3 w-3" /> Full Name
                                </label>
                                <div className="p-3 rounded-lg border bg-muted/30 text-sm font-medium">{user.name || "—"}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                    <Mail className="h-3 w-3" /> Email
                                </label>
                                <div className="p-3 rounded-lg border bg-muted/30 text-sm font-medium">{user.email}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                    <Shield className="h-3 w-3" /> Role
                                </label>
                                <div className="p-3 rounded-lg border bg-muted/30 text-sm font-medium capitalize">{user.role}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                    <Shield className="h-3 w-3" /> Archetype
                                </label>
                                <div className="p-3 rounded-lg border bg-primary/5 text-sm font-medium text-primary">{user.archetype || "Not assigned"}</div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                            <div className="text-center p-4 rounded-lg bg-muted/30">
                                <div className="text-2xl font-bold">{user.courseEnrollments.length}</div>
                                <p className="text-xs text-muted-foreground">Enrollments</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/30">
                                <div className="text-2xl font-bold">{user.testResults.length}</div>
                                <p className="text-xs text-muted-foreground">Assessments</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/30">
                                <div className="text-2xl font-bold">{totalHours}h</div>
                                <p className="text-xs text-muted-foreground">Learning Time</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
