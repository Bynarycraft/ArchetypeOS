import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT promote user from candidate to learner (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } } // no Promise here
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = params;
    const { newRole, archetype } = await request.json();

    const updateData: any = {
      role: newRole || "LEARNER",
    };

    if (archetype) {
      updateData.archetype = archetype;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Promote user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
