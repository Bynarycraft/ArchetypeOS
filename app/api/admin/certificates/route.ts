import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCertificateNumber } from "@/lib/certificates";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereConditions: any = {
      action: "certificate",
      targetId: { not: null },
    };

    if (startDate) {
      whereConditions.timestamp = {
        ...whereConditions.timestamp,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      whereConditions.timestamp = {
        ...whereConditions.timestamp,
        lte: new Date(endDate),
      };
    }

    const logs = await prisma.auditLog.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

    const courseTitleById = new Map(
      courses.map((course) => [course.id, course.title])
    );

    const enriched = logs
      .map((log) => ({
        id: log.id,
        issuedAt: log.timestamp,
        targetId: log.targetId,
        details: log.details,
        certificateNumber: formatCertificateNumber(log.id, log.timestamp),
        courseTitle: log.targetId
          ? courseTitleById.get(log.targetId) || "Course Completion"
          : "Course Completion",
        userName: log.user.name || "Unknown",
        userEmail: log.user.email || "",
        userId: log.user.id,
        verificationUrl: `/verify/certificate/${log.id}`,
      }))
      .filter(
        (item) =>
          search === "" ||
          item.userName.toLowerCase().includes(search.toLowerCase()) ||
          item.userEmail.toLowerCase().includes(search.toLowerCase()) ||
          item.courseTitle.toLowerCase().includes(search.toLowerCase())
      );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Fetch admin certificates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
