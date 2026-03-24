import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { certificateFileName, formatCertificateNumber } from "@/lib/certificates";

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

    const certificate = await prisma.auditLog.findFirst({
      where: {
        id: certificateId,
        action: "certificate",
      },
      select: {
        id: true,
        userId: true,
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
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (certificate.userId !== session.user.id && !isPrivilegedRole(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const course = certificate.targetId
      ? await prisma.course.findUnique({
          where: { id: certificate.targetId },
          select: { title: true },
        })
      : null;

    const issuedAt = new Date(certificate.timestamp);
    const issuedLabel = issuedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const certificateNumber = formatCertificateNumber(certificate.id, certificate.timestamp);
    const learnerName = certificate.user.name || certificate.user.email || "Learner";
    const courseTitle = course?.title || "Course Completion";
    const verificationUrl = new URL(`/verify/certificate/${certificate.id}`, request.url).toString();

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([842, 595]);
    const width = page.getWidth();
    const height = page.getHeight();
    const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

    page.drawRectangle({
      x: 16,
      y: 16,
      width: width - 32,
      height: height - 32,
      borderWidth: 2,
      borderColor: rgb(0.1, 0.2, 0.45),
    });

    page.drawText("ArchetypeOS", {
      x: 56,
      y: height - 90,
      size: 22,
      font: titleFont,
      color: rgb(0.1, 0.2, 0.45),
    });

    page.drawText("Certificate of Completion", {
      x: 56,
      y: height - 150,
      size: 36,
      font: titleFont,
      color: rgb(0.05, 0.05, 0.1),
    });

    page.drawText("This certifies that", {
      x: 56,
      y: height - 220,
      size: 15,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.25),
    });

    page.drawText(learnerName, {
      x: 56,
      y: height - 260,
      size: 30,
      font: titleFont,
      color: rgb(0.1, 0.15, 0.35),
    });

    page.drawText("has successfully completed", {
      x: 56,
      y: height - 300,
      size: 15,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.25),
    });

    page.drawText(courseTitle, {
      x: 56,
      y: height - 340,
      size: 26,
      font: titleFont,
      color: rgb(0.05, 0.05, 0.1),
    });

    page.drawText(`Issued: ${issuedLabel}`, {
      x: 56,
      y: 120,
      size: 12,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.25),
    });

    page.drawText(`Certificate No: ${certificateNumber}`, {
      x: 56,
      y: 96,
      size: 12,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.25),
    });

    page.drawText(`Verification: ${verificationUrl}`, {
      x: 56,
      y: 72,
      size: 12,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.25),
    });

    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 220,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
    const qrImage = await pdf.embedPng(qrDataUrl);
    page.drawImage(qrImage, {
      x: width - 170,
      y: 50,
      width: 96,
      height: 96,
    });

    page.drawText("Scan to verify", {
      x: width - 170,
      y: 36,
      size: 10,
      font: bodyFont,
      color: rgb(0.2, 0.2, 0.25),
    });

    const bytes = await pdf.save();
    const fileName = certificateFileName(certificateNumber);

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download certificate pdf error:", error);
    return NextResponse.json({ error: "Failed to generate certificate PDF" }, { status: 500 });
  }
}
