"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { TabHelperCard } from "@/components/layout/tab-helper-card";
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

      <Card>
        <CardContent className="py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Pending submissions: <span className="font-semibold text-foreground">{totalPending}</span>
          </div>
          <div className="flex items-center gap-2">
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
            <div className="text-sm min-w-[96px] text-center">
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
        <Card>
          <CardHeader>
            <CardTitle>Loading submissions</CardTitle>
            <CardDescription>Fetching pending grading queue...</CardDescription>
          </CardHeader>
        </Card>
      ) : loadError ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load grading queue</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadPendingSubmissions}>Retry</Button>
          </CardContent>
        </Card>
      ) : submissions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No pending submissions</CardTitle>
            <CardDescription>All available learner assessments are graded.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-5">
          {submissions.map((submission) => {
            const scoreInput = scores[submission.id] ?? String(submission.score ?? "");
            const parsedScore = Number(scoreInput);
            const isScoreValid = !!scoreInput.trim() && Number.isFinite(parsedScore) && parsedScore >= 0 && parsedScore <= 100;
            const isSubmitting = !!submittingById[submission.id];

            return (
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
                <CardContent className="grid gap-3 md:grid-cols-[220px_1fr_130px]">
                  <div className="space-y-1">
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
                  <Button onClick={() => submitGrade(submission)} disabled={!isScoreValid || isSubmitting}>
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Submit Grade"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
