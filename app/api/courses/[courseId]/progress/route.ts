import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;
  const body = await req.json();
  const progress = Number(body.progress);

  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return NextResponse.json({ error: "Invalid progress value" }, { status: 400 });
  }

  const status = progress >= 100 ? "completed" : "in_progress";

  try {
    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
      update: {
        progress,
        status,
        completedAt: progress >= 100 ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        courseId,
        progress,
        status,
        completedAt: progress >= 100 ? new Date() : null,
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Failed to update course progress" }, { status: 500 });
  }
}
