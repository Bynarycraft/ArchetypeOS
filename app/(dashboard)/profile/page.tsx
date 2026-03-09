import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    let user;
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
                <p className="mt-4 text-muted-foreground">We could not load your profile data right now — please try again later.</p>
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

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Profile Card */}
                <Card className="lg:col-span-1">
                    <CardContent className="pt-8 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <span className="text-4xl font-bold text-primary">{user.name?.[0] || user.email?.[0]}</span>
                        </div>
                        <h2 className="text-2xl font-bold">{user.name || "User"}</h2>
                        <div className="flex items-center gap-2 mt-3">
                            <Badge className="capitalize">{user.role}</Badge>
                            {user.archetype && <Badge variant="secondary">{user.archetype}</Badge>}
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            {user.email}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2" suppressHydrationWarning>
                            <Calendar className="h-3.5 w-3.5" />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
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
