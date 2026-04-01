"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Layers, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Roadmap = {
  id: string;
  name: string;
  archetype: string | null;
};

type Archetype = {
  id: string;
  name: string;
  description: string | null;
  roadmapId: string | null;
  roadmap?: Roadmap | null;
};

export default function AdminArchetypesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newRoadmapId, setNewRoadmapId] = useState<string>("none");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/archetypes");
      if (!res.ok) throw new Error("Failed to load archetypes");
      const payload = await res.json();
      setArchetypes(payload.archetypes || []);
      setRoadmaps(payload.roadmaps || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load archetype data");
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
      loadData();
    }
  }, [status, session, router, loadData]);

  const roadmapOptions = useMemo(() => roadmaps.map((roadmap) => ({ value: roadmap.id, label: roadmap.name })), [roadmaps]);

  const createArchetype = async () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }

    const res = await fetch("/api/admin/archetypes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        description: newDescription.trim() || null,
        roadmapId: newRoadmapId === "none" ? null : newRoadmapId,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to create archetype");
      return;
    }

    toast.success("Archetype created");
    setNewName("");
    setNewDescription("");
    setNewRoadmapId("none");
    await loadData();
  };

  const updateArchetype = async (item: Archetype) => {
    const res = await fetch(`/api/admin/archetypes/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: item.name,
        description: item.description,
        roadmapId: item.roadmapId,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to update archetype");
      return;
    }

    toast.success("Archetype updated");
    await loadData();
  };

  const deleteArchetype = async (id: string) => {
    const confirmed = window.confirm("Delete this archetype?");
    if (!confirmed) return;

    const res = await fetch(`/api/admin/archetypes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete archetype");
      return;
    }

    toast.success("Archetype deleted");
    await loadData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Layers}
        title="Archetype Management"
        description="Create and maintain archetypes, then link each archetype to a roadmap path."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" /> Create Archetype
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Archetype name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          <Select value={newRoadmapId} onValueChange={setNewRoadmapId}>
            <SelectTrigger>
              <SelectValue placeholder="Select roadmap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No roadmap</SelectItem>
              {roadmapOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={createArchetype}>Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Archetypes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading archetypes...</p>
          ) : archetypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No archetypes found.</p>
          ) : (
            archetypes.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="grid gap-2 md:grid-cols-4">
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      setArchetypes((prev) =>
                        prev.map((row) => (row.id === item.id ? { ...row, name: e.target.value } : row)),
                      )
                    }
                  />
                  <Input
                    value={item.description || ""}
                    placeholder="Description"
                    onChange={(e) =>
                      setArchetypes((prev) =>
                        prev.map((row) => (row.id === item.id ? { ...row, description: e.target.value } : row)),
                      )
                    }
                  />
                  <Select
                    value={item.roadmapId || "none"}
                    onValueChange={(value) =>
                      setArchetypes((prev) =>
                        prev.map((row) =>
                          row.id === item.id ? { ...row, roadmapId: value === "none" ? null : value } : row,
                        ),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select roadmap" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No roadmap</SelectItem>
                      {roadmapOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 md:justify-end">
                    <Button size="sm" onClick={() => updateArchetype(item)}>
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteArchetype(item.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="outline">{item.roadmap?.name || "No roadmap linked"}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
