import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabHelperCard } from "@/components/layout/tab-helper-card";
import Link from "next/link";

export default async function RoadmapPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            courseEnrollments: {
                include: { course: true }
            }
        }
    });

    if (!user) return <div>User not found</div>;

    const userArchetype = user.archetype?.trim() || null;

    const matchedRoadmaps = await prisma.roadmap.findMany({
        where: userArchetype
            ? {
                archetype: {
                    equals: userArchetype,
                    mode: "insensitive",
                },
            }
            : undefined,
        include: {
            courses: true
        }
    });

    const fallbackRoadmaps = matchedRoadmaps.length === 0
        ? await prisma.roadmap.findMany({
            include: {
                courses: true
            }
        })
        : [];

    const roadmaps = matchedRoadmaps.length > 0 ? matchedRoadmaps : fallbackRoadmaps;
    const displayArchetype = userArchetype || "Unassigned";
    const isUsingFallbackRoadmap = matchedRoadmaps.length === 0 && fallbackRoadmaps.length > 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b">
                <div>
                    <h1 className="text-5xl font-black tracking-tight text-gradient">Your Roadmap</h1>
                    <p className="text-muted-foreground mt-2 text-xl font-medium">Precision learning paths for the <strong>{displayArchetype}</strong> archetype.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full font-black border-primary/20 bg-primary/5 text-primary tracking-widest uppercase text-[10px]">
                        {roadmaps.length} Path(s) Unlocked
                    </Badge>
                </div>
                <Badge variant="outline">
                    {roadmaps.length} path(s) available
                </Badge>
            </div>

            <div className="grid gap-12">
                <TabHelperCard
                    summary="This tab shows your archetype-specific path and expected learning sequence."
                    points={[
                        "See each step and its completion state.",
                        "Understand what to take next in your roadmap.",
                        "Track progression from starter modules to advanced modules.",
                    ]}
                />

                {isUsingFallbackRoadmap && (
                    <Card className="border-none glass-card rounded-[2rem]">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-black tracking-tight">Dedicated roadmap not assigned yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground font-medium">
                                No roadmap is currently mapped to <strong>{displayArchetype}</strong>. Showing the shared core roadmap so learners can still continue.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {roadmaps.map((roadmap) => (
                    <div key={roadmap.id} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-xl shadow-primary/5">
                                <GraduationCap className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{roadmap.name}</h2>
                                <p className="text-muted-foreground text-sm">{roadmap.description}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {roadmap.courses.map((course: { id: string; title: string; description: string | null }, idx: number) => {
                                const enrollment = user.courseEnrollments.find((e: { courseId: string }) => e.courseId === course.id);
                                const isCompleted = enrollment?.status === 'completed';
                                const isEnrolled = !!enrollment;

                                return (
                                    <Link key={course.id} href={`/courses/${course.id}`} className="block">
                                        <Card className="border-none glass-card rounded-[2.5rem] overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:border-primary/30">
                                            <CardContent className="p-8 space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">STEP {idx + 1}</Badge>
                                                    {isCompleted && <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">MASTERED</Badge>}
                                                </div>
                                                <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{course.title}</h3>
                                                <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                                                        style={{ width: isCompleted ? '100%' : isEnrolled ? '45%' : '0%' }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium line-clamp-2 italic">&quot;{course.description}&quot;</p>
                                                <p className="text-xs font-bold text-primary">Open course</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {roadmaps.length === 0 && (
                    <Card className="border-none glass-card p-20 flex flex-col items-center text-center rounded-[3rem]">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
                            <GraduationCap className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-2">No roadmap data available</h3>
                        <p className="text-muted-foreground max-w-sm font-medium italic">There are no roadmap records in the database yet. Add or seed a roadmap to populate this page.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
