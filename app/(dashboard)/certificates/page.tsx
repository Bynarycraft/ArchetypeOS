import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

async function getCertificateItems(userId: string): Promise<CertificateItem[]> {
  const certificates = await prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      certificateNumber: true,
      issuedAt: true,
      expiresAt: true,
      verificationCode: true,
      isVerified: true,
      courseId: true,
    },
  });

  const courseIds = Array.from(
    new Set(certificates.map((certificate) => certificate.courseId).filter(Boolean))
  );

  const courses = courseIds.length
    ? await prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, title: true },
      })
    : [];

  const courseTitleById = new Map(courses.map((course) => [course.id, course.title]));

  return certificates.map((certificate) => ({
    id: certificate.id,
    issuedAt: certificate.issuedAt.toISOString(),
    targetId: certificate.courseId,
    courseTitle: courseTitleById.get(certificate.courseId) || "General Completion",
    certificateNumber: certificate.certificateNumber,
    verificationUrl: `/verify/certificate/${certificate.verificationCode || certificate.id}`,
    downloadUrl: `/api/certificates/${certificate.id}/pdf`,
    details: certificate.expiresAt
      ? `Expires ${new Date(certificate.expiresAt).toLocaleDateString()}`
      : certificate.isVerified
        ? "Verified"
        : null,
  }));
}

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  let items: CertificateItem[] = [];
  let loadError: string | null = null;

  try {
    items = await getCertificateItems(session.user.id);
  } catch (error) {
    console.error("Failed to load certificates page:", error);
    loadError = "Unable to load certificates right now.";
  }

  const formatIssuedAt = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "Unknown" : parsed.toLocaleString();
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        icon={Award}
        title="Certificates"
        description="Certificates earned from completed modules."
      />

      {loadError ? (
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
