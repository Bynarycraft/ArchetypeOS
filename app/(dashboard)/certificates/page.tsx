"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { LoadingCard } from "@/components/layout/loading-skeleton";

type CertificateItem = {
  id: string;
  issuedAt: string;
  targetId: string | null;
  courseTitle: string;
  certificateNumber: string;
  verificationUrl: string;
  downloadUrl: string;
  details?: string | null;
};

export default function CertificatesPage() {
  const [items, setItems] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const formatIssuedAt = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "Unknown" : parsed.toLocaleString();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/certificates");
        if (!res.ok) {
          setLoadError("Unable to load certificates right now.");
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setLoadError("Certificate data is temporarily unavailable.");
        }
      } catch (_error) {
        console.error("Failed to load certificates");
        setLoadError("Unable to load certificates right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader 
        icon={Award}
        title="Certificates"
        description="Certificates earned from completed modules."
      />

      {loading ? (
        <div className="space-y-4">
          <LoadingCard />
          <LoadingCard />
        </div>
      ) : loadError ? (
        <EmptyState
          icon={Award}
          title="Certificates are unavailable"
          description={loadError}
        />
      ) : items.length === 0 ? (
        <EmptyState 
          icon={Award}
          title="No certificates earned yet"
          description="Complete modules and assessments to earn certificates of completion."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="border-none glass-card rounded-2xl hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Completion Certificate
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <div className="font-semibold text-foreground">{item.courseTitle}</div>
                <div>Issued: {formatIssuedAt(item.issuedAt)}</div>
                <div>Certificate No: {item.certificateNumber}</div>
                {item.details && <div>Details: {item.details}</div>}
                <div className="pt-2 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="rounded-xl">
                    <Link href={item.verificationUrl || "/certificates"} target="_blank">
                      <ShieldCheck className="mr-2 h-4 w-4" /> Verify
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="rounded-xl">
                    <a href={item.downloadUrl || "#"}>
                      <Download className="mr-2 h-4 w-4" /> Download PDF
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
