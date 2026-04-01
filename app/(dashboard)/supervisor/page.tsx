"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckSquare } from "lucide-react";
import { TabHelperCard } from "@/components/layout/tab-helper-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { toast } from "sonner";

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

export default function SupervisorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [submittingById, setSubmittingById] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPending, setTotalPending] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadPendingSubmissions = useCallback(async () => {
    setLoadingSubmissions(true);
    setLoadError(null);

    try {
      const res = await fetch(`/api/tests/pending?page=${currentPage}&pageSize=${pageSize}`);
      if (!res.ok) {
        throw new Error("Failed to load pending submissions");
      }

      const payload = await res.json();
      const nextTotal = Number(payload?.pagination?.total ?? 0);
      const nextTotalPages = Number(payload?.pagination?.totalPages ?? 1);

      if (currentPage > nextTotalPages && nextTotalPages > 0) {
        setCurrentPage(nextTotalPages);
        return;
      }

      const rows = (payload?.data || []).map((result: TestApiResult & { test: { id: string; title: string; course: { title: string } } }) => ({
        id: result.id,
        score: result.score,
        status: result.status,
        feedback: result.feedback,
        user: result.user,
        test: result.test,
      }));

      setSubmissions(rows);
      setTotalPending(nextTotal);
      setTotalPages(nextTotalPages);
    } catch (error) {
      console.error("Failed to load pending submissions:", error);
      setLoadError("Could not load pending submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  }, [currentPage, pageSize]);

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

    if (status === "authenticated") {
      loadPendingSubmissions();
    }
  }, [status, session, router, loadPendingSubmissions]);

  const submitGrade = async (submission: Submission) => {
    const rawScore = scores[submission.id] ?? String(submission.score ?? "");
    const score = Number(rawScore);
    const feedback = feedbacks[submission.id] ?? "";

    if (!rawScore.trim() || !Number.isFinite(score) || score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100.");
      return;
    }

    const confirmed = window.confirm(`Submit grade ${score} for ${submission.user.name || submission.user.email}?`);
    if (!confirmed) {
      return;
    }

    setSubmittingById((prev) => ({ ...prev, [submission.id]: true }));

    try {
      const res = await fetch(`/api/tests/${submission.test.id}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId: submission.id,
          score,
          feedback,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to submit grade" }));
        toast.error(data.error || "Failed to submit grade.");
        return;
      }

      setScores((prev) => {
        const next = { ...prev };
        delete next[submission.id];
        return next;
      });
      setFeedbacks((prev) => {
        const next = { ...prev };
        delete next[submission.id];
        return next;
      });
      toast.success("Grade submitted successfully.");
      await loadPendingSubmissions();
    } catch (_error) {
      toast.error("Network error while submitting grade.");
    } finally {
      setSubmittingById((prev) => {
        const next = { ...prev };
        delete next[submission.id];
        return next;
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <PageHeader 
        icon={CheckSquare}
        title="Supervisor Grading"
        description="Review pending submissions and provide feedback."
      />

      <TabHelperCard
        summary="This tab is for supervisors to review test submissions and publish grades with feedback."
        points={[
          "Inspect each learner submission by test and course.",
          "Enter a score and comments before submitting grade.",
          "Graded entries are removed from pending queue.",
        ]}
      />

      <Card>
        <CardContent className="grid gap-4 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="text-sm text-muted-foreground">
            Pending submissions: <span className="font-semibold text-foreground">{totalPending}</span>
          </div>
          <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
            <label htmlFor="pageSize" className="text-sm text-muted-foreground">Page size</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                const nextSize = Number(e.target.value);
                setPageSize(nextSize);
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={loadingSubmissions || currentPage <= 1}
            >
              Previous
            </Button>
            <div className="min-w-[96px] text-center text-sm">
              Page {currentPage} / {Math.max(totalPages, 1)}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.max(totalPages, 1)))}
              disabled={loadingSubmissions || currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {loadingSubmissions ? (
        <Card className="border-none glass-card">
          <CardHeader>
            <CardTitle>Loading submissions</CardTitle>
            <CardDescription>Fetching pending grading queue...</CardDescription>
          </CardHeader>
        </Card>
      ) : loadError ? (
        <EmptyState 
          icon={CheckSquare}
          title="Unable to load grading queue"
          description={loadError}
          action={<Button onClick={loadPendingSubmissions}>Retry</Button>}
        />
      ) : submissions.length === 0 ? (
        <EmptyState 
          icon={CheckSquare}
          title="No pending submissions"
          description="All available learner assessments are graded."
        />
      ) : (
        <div className="grid gap-5">
          {submissions.map((submission) => {
            const scoreInput = scores[submission.id] ?? String(submission.score ?? "");
            const parsedScore = Number(scoreInput);
            const isScoreValid = !!scoreInput.trim() && Number.isFinite(parsedScore) && parsedScore >= 0 && parsedScore <= 100;
            const isSubmitting = !!submittingById[submission.id];

            return (
              <Card key={submission.id} className="glass-card rounded-2xl">
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
                <CardContent className="grid gap-4 lg:grid-cols-12 lg:items-end">
                  <div className="space-y-1 lg:col-span-3">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Score"
                      value={scores[submission.id] ?? ""}
                      disabled={isSubmitting}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [submission.id]: e.target.value,
                        }))
                      }
                    />
                    {!isScoreValid ? (
                      <p className="text-xs text-rose-600">Enter a score from 0 to 100.</p>
                    ) : null}
                  </div>
                  <div className="lg:col-span-6">
                    <Input
                      placeholder="Feedback"
                      value={feedbacks[submission.id] ?? ""}
                      disabled={isSubmitting}
                      onChange={(e) =>
                        setFeedbacks((prev) => ({
                          ...prev,
                          [submission.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <Button
                      className="w-full"
                      onClick={() => submitGrade(submission)}
                      disabled={!isScoreValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Submit Grade"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
