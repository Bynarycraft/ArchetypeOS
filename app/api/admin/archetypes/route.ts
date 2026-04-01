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
    const archetypes = await prisma.archetype.findMany({
      include: {
        roadmap: { select: { id: true, name: true, archetype: true } },
      },
      orderBy: { name: "asc" },
    });

    const roadmaps = await prisma.roadmap.findMany({
      select: { id: true, name: true, archetype: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ archetypes, roadmaps });
  } catch (error) {
    console.error("Archetypes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch archetypes" }, { status: 500 });
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
      description?: string;
      roadmapId?: string | null;
    };

    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const created = await prisma.archetype.create({
      data: {
        name,
        description: body.description?.trim() || null,
        roadmapId: body.roadmapId || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Archetype create error:", error);
    return NextResponse.json({ error: "Failed to create archetype" }, { status: 500 });
  }
}
