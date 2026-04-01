import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      name?: string;
      archetype?: string | null;
      description?: string | null;
    };

    const updated = await prisma.roadmap.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.archetype !== undefined ? { archetype: body.archetype?.trim() || null } : {}),
        ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin roadmap update error:", error);
    return NextResponse.json({ error: "Failed to update roadmap" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: {
        modules: { select: { id: true } },
        courses: { select: { id: true } },
        archetypes: { select: { id: true } },
      },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    if (roadmap.modules.length > 0 || roadmap.courses.length > 0 || roadmap.archetypes.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete roadmap with linked modules, courses, or archetypes" },
        { status: 400 },
      );
    }

    await prisma.roadmap.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin roadmap delete error:", error);
    return NextResponse.json({ error: "Failed to delete roadmap" }, { status: 500 });
  }
}
