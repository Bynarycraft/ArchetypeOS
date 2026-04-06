"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter } from "lucide-react";

type AuditRow = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  timestamp: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
};

export default function AdminAuditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [actorRole, setActorRole] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (query.trim()) params.set("q", query.trim());
      if (action.trim()) params.set("action", action.trim());
      if (targetType.trim()) params.set("targetType", targetType.trim());
      if (actorRole.trim()) params.set("role", actorRole.trim());
      if (fromDate.trim()) params.set("from", fromDate.trim());
      if (toDate.trim()) params.set("to", toDate.trim());

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const payload = await res.json();
      setRows(payload.data || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [action, actorRole, fromDate, page, pageSize, query, targetType, toDate]);

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
      loadLogs();
    }
  }, [status, session, router, loadLogs]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Audit Logs"
        description="Explore critical actions across users, courses, tests, and progress events with structured filters."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Input
            placeholder="Search details, target, user..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Input
            placeholder="Action (e.g. LESSON_COMPLETED)"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
          <Select value={targetType || "all"} onValueChange={(value) => setTargetType(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Target type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All targets</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="skill">Skill</SelectItem>
              <SelectItem value="session">Session</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actorRole || "all"} onValueChange={(value) => setActorRole(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Actor role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="candidate">Candidate</SelectItem>
              <SelectItem value="learner">Learner</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <Button
            onClick={() => {
              setPage(1);
              loadLogs();
            }}
            className="md:col-span-2 xl:col-span-1"
          >
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading audit logs...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit logs found for current filters.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{row.action}</Badge>
                      {row.targetType ? <Badge variant="secondary" className="capitalize">{row.targetType}</Badge> : null}
                      <span className="text-xs text-muted-foreground">
                        {new Date(row.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {row.user.name || row.user.email || "Unknown user"} ({row.user.role})
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Target: {row.targetType || "n/a"} {row.targetId ? `(${row.targetId})` : ""}
                  </p>
                  {row.details ? (
                    <pre className="mt-2 overflow-x-auto rounded-md bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(row.details), null, 2);
                        } catch (_error) {
                          return row.details;
                        }
                      })()}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} / {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
