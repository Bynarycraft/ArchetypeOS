import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get certificates from the Certificate model
    const certificates = await prisma.certificate.findMany({
      where: {
        userId: session.user.id,
      },
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

    const payload = certificates.map((certificate) => ({
      id: certificate.id,
      issuedAt: certificate.issuedAt,
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

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Fetch certificates error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as { userId: string; courseId: string };
    const { userId, courseId } = body;

    // Verify user and course exist
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateNumber,
        verificationCode,
        issuedAt: new Date(),
        isVerified: true,
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Create certificate error:", error);
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 });
  }
}
