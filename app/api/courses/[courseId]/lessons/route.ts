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

    // For now, return a standard lesson structure
    // In future, store lessons as JSON in course or separate model
    const lessons = [
      {
        id: `${courseId}-1`,
        courseId,
        order: 1,
        title: "Course Overview",
        description: "Understand course objectives and learning outcomes",
        contentType: "text",
        duration: 10,
        isRequired: true,
      },
      {
        id: `${courseId}-2`,
        courseId,
        order: 2,
        title: "Main Content",
        description: "Primary learning material and key concepts",
        contentType: course.description ? "resource" : "text",
        duration: 30,
        isRequired: true,
      },
      {
        id: `${courseId}-3`,
        courseId,
        order: 3,
        title: "Practical Assignment",
        description: "Apply what you learned with hands-on tasks",
        contentType: "assignment",
        duration: 20,
        isRequired: false,
      },
    ];

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("[courses/[courseId]/lessons] error:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}
