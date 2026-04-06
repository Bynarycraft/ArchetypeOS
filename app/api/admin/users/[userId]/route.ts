import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizeArchetype, SUPPORTED_ARCHETYPES } from "@/lib/archetypes";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId } = await context.params;

  try {
    const body = await req.json();
    const { role, archetype, status } = body;
    const normalizedRole = role ? String(role).toLowerCase() : undefined;
    const normalizedStatus = status ? String(status).toLowerCase() : undefined;
    const normalizedArchetype = archetype === "NONE" ? null : normalizeArchetype(archetype);

    const validRoles = ['candidate', 'learner', 'supervisor', 'admin'];
    const validStatuses = ['active', 'suspended', 'archived'];
    const validArchetypes = [...SUPPORTED_ARCHETYPES, 'NONE'];

    if (normalizedRole && !validRoles.includes(normalizedRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (normalizedStatus && !validStatuses.includes(normalizedStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (archetype && !validArchetypes.includes(archetype)) {
      return NextResponse.json({ error: "Invalid archetype" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(normalizedRole && { role: normalizedRole }),
        ...(normalizedStatus && { status: normalizedStatus }),
        ...(archetype !== undefined && { archetype: normalizedArchetype }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
