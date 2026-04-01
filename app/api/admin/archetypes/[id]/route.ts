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
      description?: string;
      roadmapId?: string | null;
    };

    const updated = await prisma.archetype.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description.trim() || null } : {}),
        ...(body.roadmapId !== undefined ? { roadmapId: body.roadmapId || null } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Archetype update error:", error);
    return NextResponse.json({ error: "Failed to update archetype" }, { status: 500 });
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
    await prisma.archetype.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Archetype delete error:", error);
    return NextResponse.json({ error: "Failed to delete archetype" }, { status: 500 });
  }
}
