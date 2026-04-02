"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Course = { id: string; title: string };

type Test = {
  id: string;
  title: string;
  type: string;
  passingScore: number;
  timeLimit: number | null;
  questions: string;
  course?: { id: string; title: string } | null;
};

export default function AdminTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [courseId, setCourseId] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [testsRes, coursesRes] = await Promise.all([
          fetch("/api/admin/tests"),
          fetch("/api/courses"),
        ]);

        if (testsRes.ok) {
          setTests(await testsRes.json());
        }
        if (coursesRes.ok) {
          setCourses(await coursesRes.json());
        }
      } catch (_error) {
        toast.error("Failed to load tests");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!courseId) {
      toast.error("Select a course before creating a test");
      return;
    }

    const submittedForm = event.currentTarget;
    const submittedData = new FormData(submittedForm);
    const title = (submittedData.get("title") as string | null)?.trim() || "";
    const description = (submittedData.get("description") as string | null)?.trim() || "";
    const type = (submittedData.get("type") as string | null)?.trim() || "MCQ";
    const passingScore = (submittedData.get("passingScore") as string | null)?.trim() || "70";
    const timeLimit = (submittedData.get("timeLimit") as string | null)?.trim() || "";
    const questionsRaw = (submittedData.get("questions") as string | null)?.trim() || "";

    if (!title) {
      toast.error("Test title is required");
      return;
    }

    let parsedQuestions: unknown;
    try {
      parsedQuestions = JSON.parse(questionsRaw);
    } catch (_error) {
      toast.error("Questions must be valid JSON");
      return;
    }

    if (!Array.isArray(parsedQuestions)) {
      toast.error("Questions must be a JSON array");
      return;
    }

    const payload = {
      courseId,
      title,
      description: description || null,
      type,
      passingScore: Number(passingScore || 70),
      timeLimit: timeLimit ? Number(timeLimit) : null,
      questions: parsedQuestions,
    };

    try {
      setCreating(true);
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newTest = await res.json();
        setTests((prev) => [newTest, ...prev]);
        submittedForm.reset();
        setCourseId("");
        toast.success("Test created");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to create test");
      }
    } catch (_error) {
      toast.error("Failed to create test");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="pb-2 border-b border-border/10">
        <h1 className="text-4xl font-black tracking-tight text-gradient">Test Management</h1>
        <p className="text-muted-foreground mt-2 text-sm font-medium">Create and track assessments.</p>
      </div>

      <Card className="border-none glass-card rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg font-black">Create New Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form ref={formRef} onSubmit={handleCreate} className="space-y-4">
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input name="title" placeholder="Test title" />
            <Input name="description" placeholder="Short description" />
            <div className="grid gap-4 md:grid-cols-3">
              <Input name="passingScore" placeholder="Passing score" defaultValue="70" />
              <Input name="timeLimit" placeholder="Time limit (minutes)" />
              <Input name="type" placeholder="Type" defaultValue="MCQ" />
            </div>
            <Textarea
              name="questions"
              placeholder='Questions JSON (e.g. [{"q":"Question?","options":["A","B"],"correct":0}])'
              className="min-h-[160px]"
            />
            <Button type="submit" disabled={creating} className="rounded-2xl font-black">
              {creating ? "Creating..." : "Create Test"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none glass-card rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg font-black">Existing Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading tests...</div>
          ) : tests.length === 0 ? (
            <div className="text-sm text-muted-foreground">No tests yet.</div>
          ) : (
            tests.map((test) => {
              let questionCount = 0;
              try {
                const parsed = JSON.parse(test.questions);
                questionCount = Array.isArray(parsed) ? parsed.length : 0;
              } catch (_error) {
                questionCount = 0;
              }

              return (
                <div key={test.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-border/30 p-4">
                  <div>
                    <p className="font-bold text-sm">{test.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {test.course?.title || "Unassigned"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{test.type}</Badge>
                    <Badge variant="outline">{questionCount} questions</Badge>
                    <Badge variant="outline">Passing {test.passingScore}%</Badge>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
