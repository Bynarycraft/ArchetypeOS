"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { FileText, Search } from "lucide-react";

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
  }, [action, page, pageSize, query]);

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
        description="Track critical actions across users, courses, tests, and progress events."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
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
          <Button onClick={() => { setPage(1); loadLogs(); }}>
            <Search className="mr-2 h-4 w-4" /> Apply Filters
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
                  {row.details ? <p className="mt-1 text-sm">{row.details}</p> : null}
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
