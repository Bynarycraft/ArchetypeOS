import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isYouTubeVideoAvailable, normalizeCourseContentUrl } from "@/lib/content-url";

// GET course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        tests: {
          select: {
            id: true,
            title: true,
            type: true,
          }
        }
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Get enrollment count
    const enrollmentCount = await prisma.courseEnrollment.count({
      where: { courseId }
    });

    return NextResponse.json({
      ...course,
      _count: {
        enrollments: enrollmentCount
      }
    });
  } catch (error) {
    console.error("Get course error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update course (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();

    if (!session || (role !== "admin" && role !== "supervisor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId } = await params;
    const body = await request.json();
    const { title, description, difficulty, contentType, contentUrl, content, duration } = body;
    const normalizedContentUrl = normalizeCourseContentUrl(contentType, contentUrl);

    if (contentType === "video" && contentUrl && !normalizedContentUrl) {
      return NextResponse.json(
        { error: "Please provide a valid YouTube link for video courses." },
        { status: 400 }
      );
    }

    if (contentType === "video" && normalizedContentUrl) {
      const isAvailable = await isYouTubeVideoAvailable(normalizedContentUrl);

      if (!isAvailable) {
        return NextResponse.json(
          { error: "This YouTube video is unavailable. Use a public, reachable YouTube URL." },
          { status: 400 }
        );
      }
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        difficulty,
        contentType,
        contentUrl: normalizedContentUrl,
        content: contentType === "text" ? (content ?? null) : null,
        duration: typeof duration === "number" ? duration : null,
      },
    });


    return NextResponse.json(course);
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE course (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId } = await params;

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
