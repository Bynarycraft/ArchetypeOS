import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/courses/[courseId]/lessons/[lessonId]/complete
 * Mark a lesson as complete for the user
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId } = await params;
    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    // Check enrollment
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    // Get all lessons for this course (currently 3 standard lessons)
    const totalLessons = 3;

    // Calculate new progress - assuming 3 lessons, each is ~33%
    // This is stored as a JSON string in the audit log for now
    const lessonNumber = parseInt(lessonId.split("-")[1], 10);
    const newProgress = Math.min(100, Math.round((lessonNumber / totalLessons) * 100));

    // Update enrollment progress
    const updated = await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: newProgress,
        status: newProgress >= 100 ? "completed" : "in_progress",
        completedAt: newProgress >= 100 ? new Date() : null,
      },
    });

    // Log the completion
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "LESSON_COMPLETED",
        targetType: "course",
        targetId: courseId,
        details: `Completed lesson ${lessonId}, course progress: ${newProgress}%`,
      },
    });

    return NextResponse.json({
      success: true,
      enrollment: updated,
      progress: newProgress,
      allComplete: newProgress >= 100,
    });
  } catch (error) {
    console.error("[lessons/[lessonId]/complete] error:", error);
    return NextResponse.json({ error: "Failed to mark lesson complete" }, { status: 500 });
  }
}
