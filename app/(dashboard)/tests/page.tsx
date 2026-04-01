import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Clock3, ArrowRight } from "lucide-react";
import { TabHelperCard } from "@/components/layout/tab-helper-card";

export default async function TestsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const role = session.user.role?.toLowerCase();
  let candidateCourseIds: string[] = [];

  if (role === "candidate") {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    });
    candidateCourseIds = enrollments.map((enrollment) => enrollment.courseId);
  }

  const tests = await prisma.test.findMany({
    where: role === "candidate" ? { courseId: { in: candidateCourseIds } } : undefined,
    include: {
      course: {
        select: {
          id: true,
          title: true,
          difficulty: true,
        },
      },
      results: {
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-4xl font-black tracking-tight">Assessments</h1>
        <p className="mt-2 text-muted-foreground">Review and take tests mapped to your courses.</p>
      </div>

      <TabHelperCard
        summary="This tab contains all assigned assessments and your latest result for each one."
        points={[
          "Start new tests or retake completed ones.",
          "View time limits before beginning an attempt.",
          "Use score feedback to identify improvement areas.",
        ]}
      />

      {tests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No tests yet</CardTitle>
            <CardDescription>Tests appear here once courses have published assessments.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {tests.map((test) => {
            const lastResult = test.results[0];
            const resultStatus = lastResult ? `Last score: ${lastResult.score}%` : "Not attempted yet";

            return (
              <Card key={test.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{test.title}</CardTitle>
                      <CardDescription className="mt-1">Course: {test.course.title}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {test.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    <span>{test.timeLimit ? `${test.timeLimit} min limit` : "No time limit"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    <span>{resultStatus}</span>
                  </div>
                  <Link href={`/courses/${test.course.id}/test/${test.id}`}>
                    <Button className="w-full">
                      {lastResult ? "Retake Test" : "Start Test"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
