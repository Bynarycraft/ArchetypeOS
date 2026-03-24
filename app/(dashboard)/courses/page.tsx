import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TabHelperCard } from "@/components/layout/tab-helper-card";
import { normalizeArchetype } from "@/lib/archetypes";

export default async function CoursesPage() {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const normalizedArchetype = normalizeArchetype(session?.user?.archetype);

    type CourseWithRoadmap = Prisma.CourseGetPayload<{ include: { roadmap: true } }>;
    let courses: CourseWithRoadmap[] = [];
    try {
        if (role === "candidate" && session?.user?.id) {
            const enrollments = await prisma.courseEnrollment.findMany({
                where: { userId: session.user.id },
                include: { course: { include: { roadmap: true } } }
            });
            courses = enrollments.map((enrollment: { course: typeof courses[number] }) => enrollment.course);
        } else if (role === "learner" && session?.user?.id) {
            courses = await prisma.course.findMany({
                where: normalizedArchetype
                    ? {
                        OR: [
                            {
                                roadmap: {
                                    archetype: {
                                        equals: normalizedArchetype,
                                        mode: "insensitive",
                                    },
                                },
                            },
                            {
                                enrollments: {
                                    some: {
                                        userId: session.user.id,
                                    },
                                },
                            },
                        ],
                    }
                    : {
                        enrollments: {
                            some: {
                                userId: session.user.id,
                            },
                        },
                    },
                include: { roadmap: true },
            });
        } else {
            courses = await prisma.course.findMany({
                include: { roadmap: true }
            });
        }
    } catch (err) {
        // DB unavailable — render fallback empty list and log the error.
        console.error('[courses] prisma error:', err);
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Courses</h1>
                    <p className="text-muted-foreground mt-1">Browse and enroll in available learning modules.</p>
                </div>
                <Badge variant="outline" className="w-fit">
                    {courses.length} courses available
                </Badge>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2 lg:col-span-3">
                    <TabHelperCard
                        summary="This tab lists all available courses and lets users open detailed learning pages."
                        points={[
                            "Compare module difficulty and content type.",
                            "Open any course card to view details and lessons.",
                            "Start or continue learning paths from one place.",
                        ]}
                    />
                </div>
                {courses.map((course) => (
                    <Link href={`/courses/${course.id}`} key={course.id} className="group transition-all duration-500 hover:-translate-y-2 active:scale-95">
                        <Card className="flex flex-col h-full border-none glass-card rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 group-hover:shadow-primary/10 transition-all duration-500">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex justify-between items-start mb-6">
                                    <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-[10px]">
                                        {course.roadmap?.archetype || "CORE"}
                                    </Badge>
                                    <Badge className={`text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full border-none shadow-sm ${course.difficulty?.toLowerCase() === 'beginner' ? 'bg-emerald-500/10 text-emerald-500' :
                                        course.difficulty?.toLowerCase() === 'intermediate' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-rose-500/10 text-rose-500'
                                        }`}>
                                        {course.difficulty}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{course.title}</CardTitle>
                                <CardDescription className="line-clamp-3 mt-3 leading-relaxed font-medium text-sm italic">&quot;{course.description}&quot;</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 px-8 pb-8 pt-4">
                                <div className="p-4 rounded-[1.5rem] bg-secondary/30 border border-white/5 flex items-center justify-between group-hover:bg-primary/5 transition-colors duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{course.duration ? `${course.duration} min` : "Self-paced"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-right">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Est. Time</span>
                                            <span className="text-[11px] font-bold text-foreground">{course.duration ? `${course.duration}m` : "TBD"}</span>
                                        </div>
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="px-8 pb-8 pt-0">
                                <Button className="w-full h-12 font-black uppercase text-[10px] tracking-widest rounded-2xl bg-secondary hover:bg-primary hover:text-white transition-all duration-500 text-foreground group-hover:bg-primary group-hover:text-white shadow-xl shadow-primary/0 group-hover:shadow-primary/20">
                                    Analyze Module
                                </Button>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
