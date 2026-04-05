import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX } from "lucide-react";
import { prisma } from "@/lib/prisma";

type VerifyPageProps = {
  params: Promise<{ certificateId: string }>;
};

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { certificateId } = await params;

  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [{ id: certificateId }, { verificationCode: certificateId }],
    },
    select: {
      id: true,
      certificateNumber: true,
      issuedAt: true,
      expiresAt: true,
      isVerified: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  const isExpired = certificate.expiresAt ? new Date(certificate.expiresAt) < new Date() : false;
  const isValid = certificate.isVerified && !isExpired;

  const learnerName = certificate.user.name || certificate.user.email || "Learner";
  const courseTitle = certificate.course?.title || "Course Completion";
  const certNumber = certificate.certificateNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className={`shadow-lg ${isValid ? "border border-emerald-200" : "border border-rose-200"}`}>
          <CardHeader className={`border-b ${isValid ? "border-emerald-100 bg-emerald-50/60" : "border-rose-100 bg-rose-50/60"}`}>
            <div className="flex items-center justify-between gap-3">
              <CardTitle
                className={`text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 ${isValid ? "text-emerald-700" : "text-rose-700"}`}
              >
                {isValid ? <ShieldCheck className="h-6 w-6" /> : <ShieldX className="h-6 w-6" />}
                {isValid ? "Certificate Verified" : "Certificate Invalid"}
              </CardTitle>
              <Badge className={isValid ? "bg-emerald-600 text-white hover:bg-emerald-600" : "bg-rose-600 text-white hover:bg-rose-600"}>
                {isValid ? "Valid" : "Invalid"}
              </Badge>
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
                <p className="text-sm text-foreground">{new Date(certificate.issuedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Record ID</p>
                <p className="text-sm text-foreground break-all">{certificate.id}</p>
              </div>
            </div>
            {certificate.expiresAt && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Expires</p>
                <p className="text-sm text-muted-foreground">{new Date(certificate.expiresAt).toLocaleString()}</p>
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
