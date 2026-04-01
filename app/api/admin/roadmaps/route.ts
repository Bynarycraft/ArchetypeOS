import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        modules: {
          select: {
            id: true,
            name: true,
            order: true,
            _count: { select: { courses: true } },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(roadmaps);
  } catch (error) {
    console.error("Admin roadmaps fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch roadmaps" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      archetype?: string;
      description?: string;
    };

    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Roadmap name is required" }, { status: 400 });
    }

    const created = await prisma.roadmap.create({
      data: {
        name,
        archetype: body.archetype?.trim() || null,
        description: body.description?.trim() || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Admin roadmap create error:", error);
    return NextResponse.json({ error: "Failed to create roadmap" }, { status: 500 });
  }
}
