import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT end learning session and add reflection
export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = params;
    const { reflection } = await request.json();

    // End session
    const learningSession = await prisma.learningSession.findUnique({
      where: { id: sessionId },
    });

    if (!learningSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (learningSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const endTime = new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - learningSession.startTime.getTime()) / 60000
    );

    const updated = await prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        durationMinutes,
      },
    });

    // Create reflection if provided
    if (reflection && prisma.reflection) {
      await prisma.reflection.create({
        data: {
          userId: session.user.id,
          learningSessionId: sessionId,
          text: reflection,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
