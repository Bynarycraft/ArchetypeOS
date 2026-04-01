import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ certificateId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { certificateId } = await params;

    // Find certificate by ID or verificationCode
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id: certificateId },
          { verificationCode: certificateId },
        ],
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
      },
    });

    if (!certificate) {
      return NextResponse.json({ valid: false, error: "Certificate not found" }, { status: 404 });
    }

    // Check if certificate is expired
    const isExpired = certificate.expiresAt && new Date(certificate.expiresAt) < new Date();

    return NextResponse.json({
      valid: certificate.isVerified && !isExpired,
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        learnerName: certificate.user.name || certificate.user.email || "Learner",
        isVerified: certificate.isVerified,
        isExpired,
      },
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    return NextResponse.json({ valid: false, error: "Failed to verify certificate" }, { status: 500 });
  }
}
