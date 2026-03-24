"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notebook, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { LoadingCard } from "@/components/layout/loading-skeleton";

type ReflectionItem = {
  id: string;
  text: string;
  mood: string | null;
  createdAt: string;
  learningSession?: {
    id: string;
    startTime: string;
    endTime: string | null;
    durationMinutes: number | null;
  } | null;
  comments?: Array<{
    id: string;
    text: string;
    createdAt: string;
    sender?: { name?: string | null; email?: string | null } | null;
  }>;
};

export default function ReflectionsPage() {
  const [items, setItems] = useState<ReflectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reflections?includeComments=1");
        if (res.ok) {
          setItems(await res.json());
        }
      } catch (_error) {
        console.error("Failed to load reflections");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader 
        icon={Notebook}
        title="Reflections"
        description="Daily reflections captured after learning sessions."
      />

      {loading ? (
        <div className="space-y-4">
          <LoadingCard />
          <LoadingCard />
        </div>
      ) : items.length === 0 ? (
        <EmptyState 
          icon={Notebook}
          title="No reflections yet"
          description="After completing learning sessions, your reflections will appear here."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="border-none glass-card rounded-2xl hover:shadow-md transition-shadow">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-lg font-black">Session Reflection</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-3">
                <p className="text-sm text-muted-foreground">{item.text}</p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-3 w-3" /> {new Date(item.createdAt).toLocaleString()}
                  </span>
                  {item.mood && <span>Mood: {item.mood}</span>}
                  {item.learningSession?.durationMinutes && (
                    <span>Duration: {item.learningSession.durationMinutes}m</span>
                  )}
                </div>
                {item.comments && item.comments.length > 0 && (
                  <div className="rounded-2xl border border-border/30 p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Supervisor Comments</p>
                    {item.comments.map((comment) => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-bold">
                          {comment.sender?.name || comment.sender?.email || "Supervisor"}:
                        </span>{" "}
                        <span className="text-muted-foreground">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
