import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Activity,
    BookOpen,
    CheckCircle2,
    Clock,
    GraduationCap,
    PlayCircle,
    TrendingUp,
    UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TabHelperCard } from "@/components/layout/tab-helper-card";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    type DashboardUser = Prisma.UserGetPayload<{
        include: {
            courseEnrollments: { include: { course: true } };
            dailyLearningSessions: { orderBy: { startTime: "desc" }; take: 5 };
            testResults: {
                include: { test: { include: { course: true } } };
                orderBy: { submittedAt: "desc" };
                take: 5;
            };
        };
    }>;

    let user: DashboardUser | null = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                courseEnrollments: {
                    include: { course: true }
                },
                dailyLearningSessions: {
                    orderBy: { startTime: 'desc' },
                    take: 5
                },
                testResults: {
                    include: {
                        test: {
                            include: { course: true }
                        }
                    },
                    orderBy: { submittedAt: 'desc' },
                    take: 5
                }
            }
        });
    } catch (err) {
        // If DB errors occur, show a graceful fallback UI instead of crashing
        console.error('[dashboard] prisma error:', err);
        return (
            <div className="p-12 text-center">
                <h2 className="text-2xl font-bold">Data currently unavailable</h2>
                <p className="mt-4 text-muted-foreground">We couldn&apos;t load your dashboard data right now, please try again later.</p>
            </div>
        );
    }

    if (!user) return <div>User not found</div>;

    const archetype = user.archetype;
    const completedCourses = user.courseEnrollments.filter((e: { status: string }) => e.status === 'completed').length;
    const activeRoadmaps = await prisma.roadmap.count({
        where: { archetype: archetype || 'NONE' }
    });

    const totalLearningMinutes = user.dailyLearningSessions.reduce(
        (acc: number, s: { durationMinutes: number | null }) => acc + (s.durationMinutes || 0), 0
    );
    const totalLearningHours = (totalLearningMinutes / 60).toFixed(1);

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Welcome back, {user.name?.split(' ')[0] || 'User'}
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        You&apos;ve logged <span className="text-foreground font-semibold">{totalLearningHours}h</span> in your sessions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/profile">
                        <Button variant="outline">View Profile</Button>
                    </Link>
                    <Link href="/courses">
                        <Button>
                            <PlayCircle className="mr-2 h-4 w-4" /> Start Learning
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <TabHelperCard
                summary="This is the learner home screen for quick progress checks and next actions."
                points={[
                    "Review current learning hours and completion stats.",
                    "Open recommended modules based on your archetype.",
                    "Jump directly into courses or your profile.",
                ]}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Archetype", value: archetype || "Unassigned", icon: UserCheck, desc: "Your profile type" },
                    { label: "Learning Hours", value: `${totalLearningHours}h`, icon: Clock, desc: "Total time logged" },
                    { label: "Courses Done", value: completedCourses, icon: CheckCircle2, desc: `Out of ${user.courseEnrollments.length} enrolled` },
                    { label: "Active Roadmaps", value: activeRoadmaps, icon: GraduationCap, desc: "Paths available" },
                ].map((stat, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</CardTitle>
                            <stat.icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="lg:col-span-4">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription className="text-xs">Your latest assessment results</CardDescription>
                            </div>
                            <Link href="/courses">
                                <Button variant="ghost" size="sm" className="text-xs">
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {user.testResults.length > 0 ? (
                                user.testResults.map((result: {
                                    id: string;
                                    score: number | null;
                                    submittedAt: Date | null;
                                    test: { course: { id: string; title: string } };
                                }) => (
                                    <Link
                                        href={`/courses/${result.test.course.id}`}
                                        key={result.id}
                                        className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium">{result.test.course.title}</h4>
                                                <p className="text-xs text-muted-foreground">Assessment completed</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${result.score && result.score >= 80 ? 'text-emerald-600' : 'text-primary'}`}>
                                                {result.score ? `${result.score}%` : 'Pending'}
                                            </div>
                                            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                                                {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'Active'}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">No activity yet</p>
                                    <Link href="/courses">
                                        <Button variant="link" className="text-xs mt-2">Start your first course</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recommended */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recommended</CardTitle>
                        <CardDescription className="text-xs">Based on your {archetype || "profile"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-5 rounded-xl bg-muted/50 border">
                            <Badge className="mb-2">Next Path</Badge>
                            <h4 className="font-semibold text-base">Advanced Learning for {archetype || "Your Profile"}</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Elevate your skills through targeted frameworks and performance patterns.</p>
                            <div className="mt-4">
                                <Link href="/courses">
                                    <Button size="sm">
                                        <PlayCircle className="mr-2 h-4 w-4" /> Explore
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="p-5 rounded-xl border-2 border-dashed text-center">
                            <p className="text-xs text-muted-foreground">Discover more paths aligned with your goals.</p>
                            <Link href="/roadmap">
                                <Button variant="outline" size="sm" className="mt-3">
                                    View Roadmap
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
