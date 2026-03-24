import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCertificateNumber } from "@/lib/certificates";

type VerifyPageProps = {
  params: Promise<{ certificateId: string }>;
};

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { certificateId } = await params;

  const certificate = await prisma.auditLog.findFirst({
    where: {
      id: certificateId,
      action: "certificate",
    },
    select: {
      id: true,
      timestamp: true,
      targetId: true,
      details: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  const course = certificate.targetId
    ? await prisma.course.findUnique({
        where: { id: certificate.targetId },
        select: { title: true },
      })
    : null;

  const learnerName = certificate.user.name || certificate.user.email || "Learner";
  const courseTitle = course?.title || "Course Completion";
  const certNumber = formatCertificateNumber(certificate.id, certificate.timestamp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="border border-emerald-200 shadow-lg">
          <CardHeader className="border-b border-emerald-100 bg-emerald-50/60">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-6 w-6" /> Certificate Verified
              </CardTitle>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Valid</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Certificate Number</p>
              <p className="text-base font-semibold text-foreground">{certNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Learner</p>
              <p className="text-2xl font-black tracking-tight">{learnerName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Completed Program</p>
              <p className="text-lg font-bold text-foreground">{courseTitle}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Issued</p>
                <p className="text-sm text-foreground">{new Date(certificate.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Record ID</p>
                <p className="text-sm text-foreground break-all">{certificate.id}</p>
              </div>
            </div>
            {certificate.details && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Notes</p>
                <p className="text-sm text-muted-foreground">{certificate.details}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldX className="h-4 w-4" />
          If this link is altered or deleted, verification will fail.
        </div>
      </div>
    </div>
  );
}
