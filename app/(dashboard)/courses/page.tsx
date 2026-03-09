import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export default async function CoursesPage() {
    let courses: Array<{
        id: string;
        title: string;
        description: string | null;
        difficulty: string;
        contentType: string;
        contentUrl: string | null;
        duration: number | null;
        roadmap: { id: string; archetype: string | null } | null;
    }> = [];
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    try {
        if (role === "candidate" && session?.user?.id) {
            const enrollments = await prisma.courseEnrollment.findMany({
                where: { userId: session.user.id },
                include: { course: { include: { roadmap: true } } }
            });
            courses = enrollments.map((enrollment: { course: typeof courses[number] }) => enrollment.course);
        } else {
            courses = await prisma.course.findMany({
                include: { roadmap: true }
            });
        }
    } catch (err) {
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

            {courses.length === 0 ? (
                <div className="text-center py-16">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No courses available</h3>
                    <p className="text-muted-foreground mt-1">Check back later for new learning content.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Link href={`/courses/${course.id}`} key={course.id} className="group">
                            <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="secondary" className="capitalize">
                                            {course.roadmap?.archetype || "General"}
                                        </Badge>
                                        <Badge variant={
                                            course.difficulty === 'beginner' ? 'default' :
                                            course.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                                        } className="capitalize">
                                            {course.difficulty}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-1">{course.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 pb-3">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            <span className="capitalize">{course.contentType || "Mixed"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{course.duration ? `${course.duration} min` : "Self-paced"}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        View Course
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
