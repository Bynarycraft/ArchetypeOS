import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

    const archetype = user.archetype || 'Maker';

    const roadmaps = await prisma.roadmap.findMany({
        where: { archetype: archetype },
        include: { courses: true }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Your Roadmap</h1>
                    <p className="text-muted-foreground mt-1">Learning paths for the <strong className="capitalize">{archetype}</strong> archetype.</p>
                </div>
                <Badge variant="outline">
                    {roadmaps.length} path(s) available
                </Badge>
            </div>

            <div className="space-y-10">
                {roadmaps.map((roadmap: {
                    id: string;
                    name: string;
                    description: string | null;
                    courses: Array<{ id: string; title: string; description: string | null }>;
                }) => (
                    <div key={roadmap.id} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <GraduationCap className="h-6 w-6" />
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
                                    <Link key={course.id} href={`/courses/${course.id}`}>
                                        <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="secondary">Step {idx + 1}</Badge>
                                                    {isCompleted && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Completed</Badge>}
                                                </div>
                                                <h3 className="text-lg font-semibold">{course.title}</h3>
                                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                                                        style={{ width: isCompleted ? '100%' : isEnrolled ? '45%' : '0%' }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {roadmaps.length === 0 && (
                    <Card className="p-16 flex flex-col items-center text-center">
                        <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Roadmaps Available</h3>
                        <p className="text-muted-foreground max-w-sm">Roadmaps matching your archetype will appear here once created by an administrator.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
