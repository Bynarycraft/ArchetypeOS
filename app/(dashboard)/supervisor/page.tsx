"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TabHelperCard } from "@/components/layout/tab-helper-card";

type Submission = {
  id: string;
  score: number;
  status: string;
  feedback: string | null;
  user: { name: string | null; email: string | null };
  test: { id: string; title: string; course: { title: string } };
};

type TestApiResult = {
  id: string;
  score: number;
  status: string;
  feedback: string | null;
  user: { name: string | null; email: string | null };
};

type TestApiItem = {
  id: string;
  title: string;
  course: { title: string };
  results: TestApiResult[];
};

export default function SupervisorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    const role = session?.user?.role?.toLowerCase();
    if (status === "authenticated" && role !== "supervisor" && role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const load = async () => {
      const res = await fetch("/api/tests");
      if (!res.ok) return;
      const tests = (await res.json()) as TestApiItem[];
      const rows: Submission[] = tests
        .flatMap((test) =>
          (test.results || []).map((result) => ({
            ...result,
            test: {
              id: test.id,
              title: test.title,
              course: test.course,
            },
          }))
        )
        .filter((r: Submission) => r.status !== "graded");

      setSubmissions(rows);
    };

    if (status === "authenticated") {
      load();
    }
  }, [status, session, router]);

  const submitGrade = async (submission: Submission) => {
    const score = Number(scores[submission.id] ?? submission.score ?? 0);
    const feedback = feedbacks[submission.id] ?? "";

    const res = await fetch(`/api/tests/${submission.test.id}/grade`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resultId: submission.id,
        score,
        feedback,
      }),
    });

    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-4xl font-black tracking-tight">Supervisor Grading</h1>
        <p className="mt-2 text-muted-foreground">Review pending submissions and provide feedback.</p>
      </div>

      <TabHelperCard
        summary="This tab is for supervisors to review test submissions and publish grades with feedback."
        points={[
          "Inspect each learner submission by test and course.",
          "Enter a score and comments before submitting grade.",
          "Graded entries are removed from pending queue.",
        ]}
      />

      {submissions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No pending submissions</CardTitle>
            <CardDescription>All available learner assessments are graded.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-5">
          {submissions.map((submission) => (
            <Card key={submission.id} className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{submission.test.title}</CardTitle>
                    <CardDescription>
                      {submission.test.course.title} - {submission.user.name || submission.user.email}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {submission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-[160px_1fr_130px]">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Score"
                  value={scores[submission.id] ?? ""}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [submission.id]: e.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Feedback"
                  value={feedbacks[submission.id] ?? ""}
                  onChange={(e) =>
                    setFeedbacks((prev) => ({
                      ...prev,
                      [submission.id]: e.target.value,
                    }))
                  }
                />
                <Button onClick={() => submitGrade(submission)}>Submit Grade</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
