"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { LoadingCard } from "@/components/layout/loading-skeleton";

type Skill = {
  name: string;
  level: number;
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/skills");
        if (res.ok) {
          setSkills(await res.json());
        }
      } catch (_error) {
        console.error("Failed to load skills");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const readinessScore = useMemo(() => {
    if (skills.length === 0) return 0;
    const avg = skills.reduce((acc, skill) => acc + skill.level, 0) / skills.length;
    return Math.round((avg / 5) * 100);
  }, [skills]);

  return (
    <div className="space-y-8">
      <PageHeader 
        icon={Brain}
        title="Skill Map"
        description="Intelligence layer built from learning + assessments."
      />

      {loading ? (
        <>
          <LoadingCard />
          <LoadingCard />
        </>
      ) : (
        <>
          <Card className="border-none glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-black">Readiness Score</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="text-4xl font-black">{readinessScore}%</div>
              <p className="text-sm text-muted-foreground">Overall readiness based on completed learning and test scores.</p>
            </CardContent>
          </Card>

          <Card className="border-none glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-black">Skill Progression</CardTitle>
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <EmptyState 
                  icon={Brain}
                  title="No skills calculated yet"
                  description="Complete learning modules and assessments to develop your skill profile."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {skills.map((skill) => (
                    <div key={skill.name} className="rounded-2xl border border-border/30 p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{skill.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Level {skill.level.toFixed(1)} / 5
                          </p>
                        </div>
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="mt-3 h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, (skill.level / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
