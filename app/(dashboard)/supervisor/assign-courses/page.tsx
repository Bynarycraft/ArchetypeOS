"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-helper";

interface Learner {
  id: string;
  name: string | null;
  email: string | null;
  archetype: string | null;
  role: string;
  courseEnrollments: Array<{
    id: string;
    courseId: string;
    status: string;
    progress: number;
    course: { id: string; title: string };
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
}

export default function SupervisorAssignCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Check auth
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    if (status === "authenticated" && session?.user?.role?.toLowerCase() !== "supervisor") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Load learners and courses
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [learnersRes, coursesRes] = await Promise.all([
          fetch("/api/supervisor/learners"),
          fetch("/api/courses"),
        ]);

        if (learnersRes.ok) {
          const learnersData = await learnersRes.json();
          setLearners(learnersData);
        }

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }
      } catch (error) {
        console.error("Failed to load data", error);
        toast.error("Failed to load learners and courses");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      load();
    }
  }, [session?.user?.id]);

  const handleAssignCourse = async (courseId: string) => {
    if (!selectedLearner) return;

    setAssigning(true);
    try {
      const res = await fetch("/api/supervisor/assign-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId: selectedLearner.id,
          courseId: courseId,
        }),
      });

      if (res.ok) {
        toast.success(`Course assigned to ${selectedLearner.name}`);
        setDialogOpen(false);
        
        // Refresh learner details
        const learnersRes = await fetch("/api/supervisor/learners");
        if (learnersRes.ok) {
          const learnersData = await learnersRes.json();
          setLearners(learnersData);
          const updated = learnersData.find((l: Learner) => l.id === selectedLearner.id);
          if (updated) {
            setSelectedLearner(updated);
          }
        }
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to assign course");
      }
    } catch (error) {
      console.error("Failed to assign course", error);
      toast.error("Failed to assign course");
    } finally {
      setAssigning(false);
    }
  };

  const filteredLearners = learners.filter(
    (learner) =>
      learner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Assign Courses to Learners"
        description="Select learners and assign courses to them according to your archetype roadmap"
      />

      {/* Search */}
      <div>
        <Input
          placeholder="Search learners by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl"
        />
      </div>

      {/* Learners Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLearners.map((learner) => (
          <Card key={learner.id} className="border-border/40 hover:border-primary/50 transition">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{learner.name || "Unnamed"}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate">{learner.email}</p>
                </div>
                <Badge variant="outline" className="shrink-0 rounded-lg">
                  {learner.archetype || "Unassigned"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{learner.courseEnrollments.length} courses enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold">
                    {learner.courseEnrollments.filter((e) => e.status === "completed").length} completed
                  </span>
                </div>
              </div>

              {/* Enrolled Courses List */}
              {learner.courseEnrollments.length > 0 && (
                <div className="rounded-lg bg-muted/40 p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Current Courses:</p>
                  <div className="space-y-1">
                    {learner.courseEnrollments.slice(0, 3).map((enrollment) => (
                      <div key={enrollment.course.id} className="flex items-center justify-between text-xs">
                        <span className="truncate flex-1">{enrollment.course.title}</span>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] h-6"
                          style={{
                            borderColor: enrollment.status === "completed" ? "#10b981" : "#f59e0b",
                            color: enrollment.status === "completed" ? "#10b981" : "#f59e0b",
                          }}
                        >
                          {enrollment.progress}%
                        </Badge>
                      </div>
                    ))}
                    {learner.courseEnrollments.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{learner.courseEnrollments.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Assign Course Dialog */}
              <Dialog open={dialogOpen && selectedLearner?.id === learner.id} onOpenChange={(open) => {
                setDialogOpen(open);
                if (open) setSelectedLearner(learner);
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full rounded-xl gap-2">
                    <Plus className="h-4 w-4" /> Assign Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Assign Course to {learner.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {courses.map((course) => {
                      const alreadyEnrolled = learner.courseEnrollments.some(
                        (e) => e.courseId === course.id
                      );
                      return (
                        <Button
                          key={course.id}
                          variant="outline"
                          className="w-full justify-start rounded-lg h-auto flex flex-col items-start p-3 disabled:opacity-50"
                          onClick={() => handleAssignCourse(course.id)}
                          disabled={alreadyEnrolled || assigning}
                        >
                          <div className="flex items-start gap-2 w-full">
                            <div className="flex-1 text-left">
                              <p className="font-semibold">{course.title}</p>
                              <p className="text-xs text-muted-foreground">{course.description}</p>
                            </div>
                            {alreadyEnrolled && (
                              <Badge variant="secondary" className="shrink-0">
                                Enrolled
                              </Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs rounded-md">
                            {course.difficulty}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLearners.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No learners found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
