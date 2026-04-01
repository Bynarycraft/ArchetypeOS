"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { LineChart } from "lucide-react";

type Learner = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  courseEnrollments: Array<{
    id: string;
    status: string;
    progress: number;
    course: { id: string; title: string; difficulty: string };
  }>;
};

type TestResult = {
  id: string;
  score: number;
  status: string;
  user: { id: string; name: string | null; email: string | null; role: string };
  test: { id: string; title: string; passingScore: number | null; type: string };
};

export default function SupervisorProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [learners, setLearners] = useState<Learner[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [learnersRes, resultsRes] = await Promise.all([
        fetch("/api/supervisor/learners"),
        fetch("/api/supervisor/test-results"),
      ]);

      if (learnersRes.ok) {
        setLearners(await learnersRes.json());
      }

      if (resultsRes.ok) {
        setResults(await resultsRes.json());
      }
    } catch (error) {
      console.error("Failed to load supervisor progress:", error);
      setLearners([]);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      loadData();
    }
  }, [status, session, router, loadData]);

  const perLearnerScores = results.reduce<Record<string, number[]>>((acc, result) => {
    if (!acc[result.user.id]) {
      acc[result.user.id] = [];
    }
    acc[result.user.id].push(result.score || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LineChart}
        title="Learner Progress"
        description="Track per-learner course completion and assessment performance trends."
      />

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading learner progress...</p>
          ) : learners.length === 0 ? (
            <p className="text-sm text-muted-foreground">No learners found under your supervision.</p>
          ) : (
            <div className="space-y-3">
              {learners.map((learner) => {
                const enrolled = learner.courseEnrollments.length;
                const completed = learner.courseEnrollments.filter((course) => course.status === "completed").length;
                const avgProgress =
                  enrolled > 0
                    ? Math.round(
                        learner.courseEnrollments.reduce((sum, course) => sum + (course.progress || 0), 0) / enrolled,
                      )
                    : 0;

                const scores = perLearnerScores[learner.id] || [];
                const avgScore = scores.length
                  ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
                  : null;

                return (
                  <div key={learner.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{learner.name || "Unnamed learner"}</p>
                        <p className="text-xs text-muted-foreground">{learner.email || "No email"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Courses: {enrolled}</Badge>
                        <Badge variant="outline">Completed: {completed}</Badge>
                        <Badge variant="outline">Progress: {avgProgress}%</Badge>
                        <Badge variant="outline">Avg score: {avgScore == null ? "N/A" : `${avgScore}%`}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
