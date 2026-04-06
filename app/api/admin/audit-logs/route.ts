import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || undefined;
    const query = url.searchParams.get("q") || undefined;
    const targetType = url.searchParams.get("targetType") || undefined;
    const actorRole = url.searchParams.get("role") || undefined;
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(5, Number(url.searchParams.get("pageSize") || "20")));
    const skip = (page - 1) * pageSize;

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (fromDate && Number.isNaN(fromDate.getTime())) {
      return NextResponse.json({ error: "Invalid from date" }, { status: 400 });
    }

    if (toDate && Number.isNaN(toDate.getTime())) {
      return NextResponse.json({ error: "Invalid to date" }, { status: 400 });
    }

    const where = {
      ...(action ? { action } : {}),
      ...(targetType ? { targetType } : {}),
      ...(actorRole ? { user: { role: actorRole } } : {}),
      ...(fromDate || toDate
        ? {
            timestamp: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              { details: { contains: query, mode: "insensitive" as const } },
              { targetType: { contains: query, mode: "insensitive" as const } },
              { targetId: { contains: query, mode: "insensitive" as const } },
              { user: { email: { contains: query, mode: "insensitive" as const } } },
              { user: { name: { contains: query, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { timestamp: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
