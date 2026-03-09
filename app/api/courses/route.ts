import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const courses = await prisma.course.findMany({
            include: {
                roadmap: true,
                tests: {
                    select: { id: true, title: true, type: true }
                },
                _count: {
                    select: { enrollments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(courses);
    } catch (_error) {
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();

    if (!session || (role !== "admin" && role !== "supervisor")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, description, difficulty, contentUrl, duration } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const course = await prisma.course.create({
            data: {
                title,
                description,
                difficulty: difficulty || "beginner",
                contentType: "video",
                contentUrl: contentUrl || null,
                duration: duration || null,
            }
        });

        return NextResponse.json(course);
    } catch (_error) {
        return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
    }
}
