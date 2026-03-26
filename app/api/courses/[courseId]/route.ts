import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeCourseContentUrl } from "@/lib/content-url";

// GET course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    if (role === "candidate") {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId,
          },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

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

    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedContentType = typeof contentType === "string" ? contentType.trim().toLowerCase() : "";
    const normalizedDifficulty = typeof difficulty === "string" && difficulty.trim().length > 0
      ? difficulty.trim().toLowerCase()
      : "beginner";
    const normalizedDescription = typeof description === "string" && description.trim().length > 0
      ? description.trim()
      : null;

    const validContentTypes = ["video", "text", "image", "pdf", "link"] as const;
    if (!normalizedTitle) {
      return NextResponse.json({ error: "Course title is required." }, { status: 400 });
    }

    if (!validContentTypes.includes(normalizedContentType as typeof validContentTypes[number])) {
      return NextResponse.json({ error: "Invalid content type." }, { status: 400 });
    }

    const normalizedContentUrl = normalizeCourseContentUrl(normalizedContentType, contentUrl);

    if (normalizedContentType !== "text" && !normalizedContentUrl) {
      return NextResponse.json({ error: "Content URL is required for non-text courses." }, { status: 400 });
    }

    if (normalizedContentType === "video" && contentUrl && !normalizedContentUrl) {
      return NextResponse.json(
        { error: "Please provide a valid YouTube link for video courses." },
        { status: 400 }
      );
    }

    const normalizedDuration =
      duration === null || duration === undefined || duration === ""
        ? null
        : Number(duration);

    if (
      normalizedDuration !== null &&
      (!Number.isFinite(normalizedDuration) || !Number.isInteger(normalizedDuration) || normalizedDuration <= 0)
    ) {
      return NextResponse.json({ error: "Duration must be a positive whole number." }, { status: 400 });
    }

    const normalizedContent =
      normalizedContentType === "text" && typeof content === "string"
        ? content.trim()
        : null;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: normalizedTitle,
        description: normalizedDescription,
        difficulty: normalizedDifficulty,
        contentType: normalizedContentType,
        contentUrl: normalizedContentUrl,
        content: normalizedContent,
        duration: normalizedDuration,
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
