import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || (role !== "supervisor" && role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") || "1"), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || "25"), 1), 100);
  const skip = (page - 1) * pageSize;

  try {
    const where = { status: "submitted" };

    const [total, results] = await Promise.all([
      prisma.testResult.count({ where }),
      prisma.testResult.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true },
          },
          test: {
            select: {
              id: true,
              title: true,
              course: {
                select: { title: true },
              },
            },
          },
        },
        orderBy: { submittedAt: "asc" },
        skip,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      data: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (error) {
    console.error("Get pending tests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
