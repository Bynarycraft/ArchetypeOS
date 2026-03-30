import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/courses/enroll
 * Allows learners/candidates to enroll in a course
 * Body: { courseId: string }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role?.toLowerCase();
  
  // Only learners and candidates can enroll
  if (role !== "learner" && role !== "candidate") {
    return NextResponse.json({ error: "Only learners and candidates can enroll in courses" }, { status: 403 });
  }

  try {
    const { courseId } = await req.json();

    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course", enrollment: existingEnrollment },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        status: "in_progress",
        progress: 0,
      },
      include: {
        course: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "COURSE_ENROLLED",
        targetType: "course",
        targetId: courseId,
        details: `Enrolled in course: ${course.title}`,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("[courses/enroll] error:", error);
    return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 });
  }
}
