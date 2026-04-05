import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Award, Clock3, MessageSquare, CircleAlert } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ResultItem = {
  id: string;
  score: number;
  status: string;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  attemptNumber: number | null;
  test: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
};

function statusLabel(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "graded") return "Graded";
  if (normalized === "submitted") return "Awaiting grading";
  if (normalized === "in_progress") return "In progress";
  return status;
}

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = session.user.role?.toLowerCase();
  if (role !== "candidate" && role !== "learner") {
    redirect("/dashboard");
  }

  const results = await prisma.testResult.findMany({
    where: { userId: session.user.id },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      score: true,
      status: true,
      feedback: true,
      submittedAt: true,
      gradedAt: true,
      attemptNumber: true,
      test: {
        select: {
          id: true,
          title: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  }) as unknown as ResultItem[];

  const gradedCount = results.filter((result) => result.status.toLowerCase() === "graded").length;
  const awaitingCount = results.filter((result) => result.status.toLowerCase() === "submitted").length;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Award}
        title="Results"
        description="Review your submitted assessments, scores, and feedback in one place."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none glass-card rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-black">{results.length}</CardContent>
        </Card>
        <Card className="border-none glass-card rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Graded</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-black text-emerald-600">{gradedCount}</CardContent>
        </Card>
        <Card className="border-none glass-card rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Awaiting Grading</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-black text-amber-600">{awaitingCount}</CardContent>
        </Card>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={CircleAlert}
          title="No results yet"
          description="Take a test and submit it to see your score and grading status here."
        />
      ) : (
        <div className="grid gap-4">
          {results.map((result) => {
            const normalizedStatus = result.status.toLowerCase();
            const isGraded = normalizedStatus === "graded";

            return (
              <Card key={result.id} className="border-none glass-card rounded-3xl">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl font-black">{result.test.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{result.test.course.title}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {statusLabel(result.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Score</p>
                      <p className={`text-2xl font-black ${isGraded ? "text-emerald-600" : "text-amber-600"}`}>
                        {isGraded ? `${result.score}%` : "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Attempt</p>
                      <p className="text-sm font-semibold">#{result.attemptNumber || 1}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Submitted</p>
                      <p className="text-sm font-semibold">
                        {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    {isGraded ? "Supervisor grading completed" : "Awaiting supervisor grading"}
                  </div>

                  {result.feedback ? (
                    <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <MessageSquare className="h-4 w-4" /> Feedback
                      </div>
                      <p className="text-sm text-muted-foreground">{result.feedback}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}