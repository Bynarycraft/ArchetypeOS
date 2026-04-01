import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BookOpen, CheckCircle2, Target, Timer } from "lucide-react";
import Link from "next/link";

export default async function CandidateHomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "candidate") {
    redirect("/dashboard");
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        courseEnrollments: { include: { course: true } },
        testResults: { include: { test: true }, orderBy: { submittedAt: "desc" } },
        dailyLearningSessions: { orderBy: { startTime: "desc" }, take: 5 },
      },
    });
  } catch (error) {
    console.error("[candidate] prisma error:", error);
  }

  if (!user) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold">Candidate data unavailable</h2>
        <p className="mt-3 text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  const completedCourses = user.courseEnrollments.filter((e: { status: string }) => e.status === "completed").length;
  const enrolledCourses = user.courseEnrollments.length;

  const passedAssessments = user.testResults.filter((result: { score: number; test: { passingScore: number } }) => {
    const passing = result.test.passingScore ?? 70;
    return result.score >= passing;
  }).length;

  const totalAssessments = user.testResults.length;
  const totalMinutes = user.dailyLearningSessions.reduce(
    (acc: number, sessionItem: { durationMinutes: number | null }) => acc + (sessionItem.durationMinutes || 0),
    0
  );

  const totalHours = (totalMinutes / 60).toFixed(1);

  const assignedCourses = user.courseEnrollments.map((enrollment: { course: { id: string; title: string; difficulty: string } }) => enrollment.course);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Candidate Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-base">
            Study your assigned course, take the assessment, and track your application status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/courses">
            <Button className="rounded-xl px-6">
              <Target className="mr-2 h-4 w-4" /> View Assigned Course
            </Button>
          </Link>
          <Link href="/notifications">
            <Button variant="outline" className="rounded-xl px-6">
              <Bell className="mr-2 h-4 w-4" /> Status Updates
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Hours Logged", value: `${totalHours}h`, icon: Timer },
          { label: "Courses Enrolled", value: enrolledCourses, icon: BookOpen },
          { label: "Courses Completed", value: completedCourses, icon: CheckCircle2 },
          { label: "Assessments Passed", value: `${passedAssessments}/${totalAssessments}`, icon: Target },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Current Enrollments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.courseEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active enrollments yet.</p>
            ) : (
              user.courseEnrollments.slice(0, 3).map((enrollment: { id: string; status: string; progress: number; course: { title: string } }) => (
                <div key={enrollment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{enrollment.course.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {enrollment.status.replace("_", " ")}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {enrollment.progress}%
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Assigned Learning Path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignedCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assigned course yet. Your coordinator will assign one shortly.</p>
            ) : (
              assignedCourses.map((course: { id: string; title: string; difficulty: string }) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="block">
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{course.difficulty}</p>
                    </div>
                    <Badge variant="outline">View</Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
