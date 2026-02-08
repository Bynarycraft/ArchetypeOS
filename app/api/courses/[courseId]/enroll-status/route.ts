import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    try {
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: courseId,
                },
            },
        });

        if (!enrollment) {
            return NextResponse.json(null);
        }

        return NextResponse.json(enrollment);
    } catch (error) {
        console.error("Enrollment status error:", error);
        return NextResponse.json({ error: "Failed to fetch enrollment status" }, { status: 500 });
    }
}
