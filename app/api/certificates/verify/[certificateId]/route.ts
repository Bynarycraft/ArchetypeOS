import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCertificateNumber } from "@/lib/certificates";

type Params = { params: Promise<{ certificateId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
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
      return NextResponse.json({ valid: false, error: "Certificate not found" }, { status: 404 });
    }

    const course = certificate.targetId
      ? await prisma.course.findUnique({
          where: { id: certificate.targetId },
          select: { title: true },
        })
      : null;

    return NextResponse.json({
      valid: true,
      certificate: {
        id: certificate.id,
        certificateNumber: formatCertificateNumber(certificate.id, certificate.timestamp),
        issuedAt: certificate.timestamp,
        learnerName: certificate.user.name || certificate.user.email || "Learner",
        courseTitle: course?.title || "Course Completion",
        details: certificate.details,
      },
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    return NextResponse.json({ valid: false, error: "Failed to verify certificate" }, { status: 500 });
  }
}
