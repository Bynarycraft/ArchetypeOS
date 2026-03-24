import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCertificateNumber } from "@/lib/certificates";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: "certificate",
        targetId: { not: null },
        userId: session.user.id,
      },
      orderBy: { timestamp: "desc" },
    });

    const courseIds = logs
      .map((log) => log.targetId)
      .filter((id): id is string => !!id);

    const courses = courseIds.length
      ? await prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, title: true },
        })
      : [];

    const courseTitleById = new Map(courses.map((course) => [course.id, course.title]));

    const enriched = logs.map((log) => ({
      id: log.id,
      issuedAt: log.timestamp,
      targetId: log.targetId,
      details: log.details,
      certificateNumber: formatCertificateNumber(log.id, log.timestamp),
      courseTitle: log.targetId ? courseTitleById.get(log.targetId) || "Course Completion" : "Course Completion",
      verificationUrl: `/verify/certificate/${log.id}`,
      downloadUrl: `/api/certificates/${log.id}/pdf`,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Fetch certificates error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}
