"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Map, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Roadmap = {
  id: string;
  name: string;
  archetype: string | null;
  description: string | null;
  modules: Array<{ id: string; name: string; order: number; _count: { courses: number } }>;
};

export default function AdminRoadmapsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [archetype, setArchetype] = useState("");
  const [description, setDescription] = useState("");

  const loadRoadmaps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roadmaps");
      if (!res.ok) throw new Error("Failed to fetch roadmaps");
      setRoadmaps(await res.json());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load roadmaps");
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
    if (status === "authenticated" && role !== "admin") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && role === "admin") {
      loadRoadmaps();
    }
  }, [status, session, router, loadRoadmaps]);

  const createRoadmap = async () => {
    if (!name.trim()) {
      toast.error("Roadmap name is required");
      return;
    }

    const res = await fetch("/api/admin/roadmaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        archetype: archetype.trim() || null,
        description: description.trim() || null,
      }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      toast.error(payload?.error || "Failed to create roadmap");
      return;
    }

    toast.success("Roadmap created");
    setName("");
    setArchetype("");
    setDescription("");
    await loadRoadmaps();
  };

  const updateRoadmap = async (item: Roadmap) => {
    const res = await fetch(`/api/admin/roadmaps/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: item.name,
        archetype: item.archetype,
        description: item.description,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to update roadmap");
      return;
    }

    toast.success("Roadmap updated");
    await loadRoadmaps();
  };

  const deleteRoadmap = async (id: string) => {
    const confirmed = window.confirm("Delete this roadmap?\n\nNote: only empty roadmaps can be deleted.");
    if (!confirmed) return;

    const res = await fetch(`/api/admin/roadmaps/${id}`, { method: "DELETE" });
    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      toast.error(payload?.error || "Failed to delete roadmap");
      return;
    }

    toast.success("Roadmap deleted");
    await loadRoadmaps();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Map}
        title="Roadmap Management"
        description="Create and maintain organization roadmaps by archetype and module structure."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" /> Create Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Roadmap name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Archetype (Maker/Catalyst...)" value={archetype} onChange={(e) => setArchetype(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={createRoadmap}>Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Roadmaps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading roadmaps...</p>
          ) : roadmaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No roadmaps found.</p>
          ) : (
            roadmaps.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="grid gap-2 md:grid-cols-4">
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      setRoadmaps((prev) => prev.map((row) => (row.id === item.id ? { ...row, name: e.target.value } : row)))
                    }
                  />
                  <Input
                    value={item.archetype || ""}
                    placeholder="Archetype"
                    onChange={(e) =>
                      setRoadmaps((prev) =>
                        prev.map((row) => (row.id === item.id ? { ...row, archetype: e.target.value || null } : row)),
                      )
                    }
                  />
                  <Input
                    value={item.description || ""}
                    placeholder="Description"
                    onChange={(e) =>
                      setRoadmaps((prev) =>
                        prev.map((row) => (row.id === item.id ? { ...row, description: e.target.value || null } : row)),
                      )
                    }
                  />
                  <div className="flex items-center gap-2 md:justify-end">
                    <Button size="sm" onClick={() => updateRoadmap(item)}>
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteRoadmap(item.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">Modules: {item.modules.length}</Badge>
                  <Badge variant="outline">
                    Courses: {item.modules.reduce((sum, module) => sum + module._count.courses, 0)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
