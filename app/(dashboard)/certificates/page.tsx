"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { LoadingCard } from "@/components/layout/loading-skeleton";

type CertificateItem = {
  id: string;
  timestamp: string;
  targetId: string | null;
  details?: string | null;
};

export default function CertificatesPage() {
  const [items, setItems] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/certificates");
        if (res.ok) {
          setItems(await res.json());
        }
      } catch (_error) {
        console.error("Failed to load certificates");
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
                <div>Issued: {new Date(item.timestamp).toLocaleString()}</div>
                {item.details && <div>Details: {item.details}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
