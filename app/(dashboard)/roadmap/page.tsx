import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function RoadmapPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            enrollments: {
                include: {
                    course: true
                }
            }
        }
    });

    if (!user) return <div>User not found</div>;

    const archetype = user.archetype || 'MAKER';

    const roadmaps = await prisma.roadmap.findMany({
        where: { archetype: archetype },
        include: {
            courses: true
        }
    });

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border/10">
                <div>
                    <h1 className="text-5xl font-black tracking-tight text-gradient">Your Roadmap</h1>
                    <p className="text-muted-foreground mt-2 text-xl font-medium">Precision learning paths for the <strong>{archetype}</strong> archetype.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full font-black border-primary/20 bg-primary/5 text-primary tracking-widest uppercase text-[10px]">
                        {roadmaps.length} Path(s) Unlocked
                    </Badge>
                </div>
            </div>

            <div className="grid gap-12">
                {roadmaps.map((roadmap) => (
                    <div key={roadmap.id} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-xl shadow-primary/5">
                                <GraduationCap className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">{roadmap.name}</h2>
                                <p className="text-muted-foreground font-medium">{roadmap.description}</p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {roadmap.courses.map((course, idx) => {
                                const enrollment = user.enrollments.find(e => e.courseId === course.id);
                                const isCompleted = enrollment?.status === 'completed';
                                const isEnrolled = !!enrollment;

                                return (
                                    <Card key={course.id} className="border-none glass-card rounded-[2.5rem] overflow-hidden group transition-all duration-500 hover:-translate-y-2">
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
                                        </CardContent>
                                    </Card>
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
                        <h3 className="text-2xl font-black tracking-tight mb-2">Generating Your Strategy...</h3>
                        <p className="text-muted-foreground max-w-sm font-medium italic">Our intelligence engine is mapping the optimal growth vectors for your profile.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
