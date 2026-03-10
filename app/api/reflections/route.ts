import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reflections = await prisma.reflection.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        learningSession: true,
      },
    });

    return NextResponse.json(reflections);
  } catch (error) {
    console.error("Get reflections error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { learningSessionId, text, mood, courseId } = await request.json();

    if (!learningSessionId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reflection = await prisma.reflection.create({
      data: {
        learningSessionId,
        text,
        mood: mood || null,
        courseId: courseId || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(reflection, { status: 201 });
  } catch (error) {
    console.error("Create reflection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
