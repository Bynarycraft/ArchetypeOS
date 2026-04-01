import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ certificateId: string }> };

function isPrivilegedRole(role?: string) {
  const normalized = role?.toLowerCase();
  return normalized === "admin" || normalized === "supervisor";
}

export async function GET(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { certificateId } = await params;

    // Get certificate from Certificate model
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      select: {
        id: true,
        userId: true,
        certificateNumber: true,
        issuedAt: true,
        expiresAt: true,
        verificationCode: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (certificate.userId !== session.user.id && !isPrivilegedRole(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const issuedAt = new Date(certificate.issuedAt);
    const issuedLabel = issuedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const expiresLabel = certificate.expiresAt
      ? new Date(certificate.expiresAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No expiration";
    const learnerName = certificate.user.name || certificate.user.email || "Learner";
    const verificationUrl = `${request.url.split("/api")[0]}/verify/certificate/${certificate.verificationCode}`;

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([842, 595]); // A4 landscape
    const width = page.getWidth();
    const height = page.getHeight();
    const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

    // Draw border
    page.drawRectangle({
      x: 16,
      y: 16,
      width: width - 32,
      height: height - 32,
      borderWidth: 2,
      borderColor: rgb(0.1, 0.2, 0.45),
    });

    // Header
    page.drawText("ArchetypeOS", {
      x: 56,
      y: height - 90,
      size: 22,
      font: titleFont,
      color: rgb(0.1, 0.2, 0.45),
    });

    // Title
    page.drawText("Certificate of Completion", {
      x: 56,
      y: height - 150,
      size: 36,
      font: titleFont,
      color: rgb(0.05, 0.05, 0.1),
    });

    // Content
    page.drawText("This certifies that", {
      x: 56,
      y: height - 220,
      size: 14,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(learnerName, {
      x: 56,
      y: height - 260,
      size: 28,
      font: titleFont,
      color: rgb(0.1, 0.2, 0.45),
    });

    page.drawText("has successfully completed the professional development requirements", {
      x: 56,
      y: height - 310,
      size: 14,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText("as demonstrated by their comprehensive learning journey on ArchetypeOS.", {
      x: 56,
      y: height - 335,
      size: 14,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Certificate details
    page.drawText(`Certificate Number: ${certificate.certificateNumber}`, {
      x: 56,
      y: height - 410,
      size: 11,
      font: bodyFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`Issued: ${issuedLabel}`, {
      x: 56,
      y: height - 430,
      size: 11,
      font: bodyFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`Expires: ${expiresLabel}`, {
      x: 56,
      y: height - 450,
      size: 11,
      font: bodyFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(verificationUrl);
    const qrImage = await pdf.embedPng(qrDataUrl);
    page.drawImage(qrImage, {
      x: width - 120,
      y: height - 180,
      width: 100,
      height: 100,
    });

    page.drawText("Scan to verify", {
      x: width - 120,
      y: height - 200,
      size: 9,
      font: bodyFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdf_bytes = await pdf.save();
    
    return new NextResponse(pdf_bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certificate.certificateNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[certificates/[certificateId]/pdf] error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
