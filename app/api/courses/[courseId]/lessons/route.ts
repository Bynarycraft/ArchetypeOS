import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/courses/[courseId]/lessons
 * Get all lessons for a course
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get all lessons for this course, ordered by lesson order
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        courseId: true,
        order: true,
        title: true,
        description: true,
        contentType: true,
        contentUrl: true,
        duration: true,
        isRequired: true,
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("[courses/[courseId]/lessons] error:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

/**
 * POST /api/courses/[courseId]/lessons
 * Create a new lesson for a course (admin only)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { courseId } = await params;
    const body = await req.json();
    const { order, title, description, contentType, contentUrl, duration, isRequired } = body;

    // Validate required fields
    if (!title || typeof order !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: title, order" },
        { status: 400 }
      );
    }

    // Check course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        order,
        title,
        description: description || null,
        contentType: contentType || "text",
        contentUrl: contentUrl || null,
        duration: duration || null,
        isRequired: isRequired !== false, // default to true
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("[courses/[courseId]/lessons] POST error:", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
