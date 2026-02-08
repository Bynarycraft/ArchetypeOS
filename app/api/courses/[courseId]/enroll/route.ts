import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    try {
        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Upsert enrollment (start if not exists)
        const enrollment = await prisma.courseEnrollment.upsert({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: course.id,
                },
            },
            update: {
                // If already completed, don't change status back to started
            },
            create: {
                userId: session.user.id,
                courseId: course.id,
                status: "started",
                progressPercent: 0,
            },
        });

        return NextResponse.json(enrollment);
    } catch (error) {
        console.error("Enrollment error:", error);
        return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 });
    }
}
