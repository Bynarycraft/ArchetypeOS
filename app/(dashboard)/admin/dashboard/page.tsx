"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { TabHelperCard } from "@/components/layout/tab-helper-card";

const AdminDashboardCharts = dynamic(
  () => import("@/components/admin/admin-dashboard-charts").then((m) => m.AdminDashboardCharts),
  { ssr: false }
);

export default function AdminDashboard() {
  type AnalyticsResponse = {
    totalLearningMinutes: number;
    averageTestScore: number;
  };

  type AdminUser = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    archetype: string | null;
    createdAt: string;
  };

  type RoleDistribution = {
    name: string;
    value: number;
  };

  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    const role = session?.user?.role?.toLowerCase();
    if (status === "authenticated" && role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, usersRes] = await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/admin/users"),
        ]);

        if (analyticsRes.ok) {
          const analyticsData = (await analyticsRes.json()) as Partial<AnalyticsResponse>;
          setAnalytics({
            totalLearningMinutes: analyticsData.totalLearningMinutes ?? 0,
            averageTestScore: analyticsData.averageTestScore ?? 0,
          });
        }
        if (usersRes.ok) {
          const usersData = (await usersRes.json()) as AdminUser[];
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    const role = session?.user?.role?.toLowerCase();
    if (status === "authenticated" && role === "admin") {
      fetchData();
      return;
    }

    if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const roleDistribution = users.reduce<RoleDistribution[]>((acc, user) => {
    const role = user.role || "unknown";
    const existing = acc.find((r) => r.name === role);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: role, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Organization-wide insights and management</p>
      </div>

      <TabHelperCard
        summary="This tab provides a management overview of organization learning performance and user distribution."
        points={[
          "Track top-level metrics like total users and average scores.",
          "Review trend charts and role distribution.",
          "Switch between overview and detailed user table tabs.",
        ]}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Learning Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalLearningMinutes ? Math.round(analytics.totalLearningMinutes / 60) : 0}
                </div>
                <p className="text-xs text-muted-foreground">Across organization</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Registered members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Test Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(analytics?.averageTestScore || 0)}%</div>
                <p className="text-xs text-muted-foreground">Organization average</p>
              </CardContent>
            </Card>
          </div>

          <AdminDashboardCharts roleDistribution={roleDistribution || []} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage system users and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Name</th>
                      <th className="text-left py-2 px-4">Email</th>
                      <th className="text-left py-2 px-4">Role</th>
                      <th className="text-left py-2 px-4">Archetype</th>
                      <th className="text-left py-2 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{user.name}</td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4">
                          <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 px-4">{user.archetype || "-"}</td>
                        <td className="py-2 px-4 text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
