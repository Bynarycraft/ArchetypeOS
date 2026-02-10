import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const { role, archetype } = body;

    const validRoles = ['candidate', 'learner', 'supervisor', 'admin'];
    const validArchetypes = ['MAKER', 'ARCHITECT', 'REFINER', 'CATALYST', 'CRAFTSMAN', 'NONE'];

    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (archetype && !validArchetypes.includes(archetype)) {
      return NextResponse.json({ error: "Invalid archetype" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(archetype && { archetype }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
