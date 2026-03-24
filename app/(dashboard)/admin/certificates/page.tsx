"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { LoadingCard } from "@/components/layout/loading-skeleton";
import { toast } from "sonner";

type Certificate = {
  id: string;
  issuedAt: string;
  targetId: string | null;
  certificateNumber: string;
  courseTitle: string;
  userName: string;
  userEmail: string;
  userId: string;
  verificationUrl: string;
};

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async (
    searchVal = "",
    start = "",
    end = ""
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchVal) params.append("search", searchVal);
      if (start) params.append("startDate", new Date(start).toISOString());
      if (end) {
        const endDateTime = new Date(end);
        endDateTime.setHours(23, 59, 59, 999);
        params.append("endDate", endDateTime.toISOString());
      }

      const res = await fetch(
        `/api/admin/certificates?${params.toString()}`
      );
      if (res.ok) {
        setCertificates(await res.json());
      } else {
        toast.error("Failed to load certificates");
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCertificates(search, startDate, endDate);
  };

  const handleReset = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    fetchCertificates("", "", "");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Create CSV headers
      const headers = [
        "Certificate #",
        "Learner Name",
        "Email",
        "Course",
        "Issued Date",
        "Verification Link",
      ];

      // Create CSV rows
      const rows = certificates.map((cert) => [
        cert.certificateNumber,
        cert.userName,
        cert.userEmail,
        cert.courseTitle,
        new Date(cert.issuedAt).toLocaleDateString("en-US"),
        `https://${typeof window !== "undefined" ? window.location.host : ""}${cert.verificationUrl}`,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificates-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Certificates exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export certificates");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Award}
        title="Certificate Registry"
        description="View and manage all issued certificates across the platform."
      />

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by name, email, or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="gap-2">
                Search
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset Filters
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={loading || exporting || certificates.length === 0}
                className="gap-2 ml-auto"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export to CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {loading ? (
        <div className="space-y-4">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Certificates Found"
          description="No certificates match your search criteria."
          action={undefined}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Certificates ({certificates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate #</TableHead>
                    <TableHead>Learner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-sm">
                        {cert.certificateNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {cert.userName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cert.userEmail}
                      </TableCell>
                      <TableCell>{cert.courseTitle}</TableCell>
                      <TableCell>
                        {new Date(cert.issuedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
