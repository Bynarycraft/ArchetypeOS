import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isYouTubeVideoAvailable, normalizeCourseContentUrl } from "@/lib/content-url";
import { normalizeArchetype } from "@/lib/archetypes";

export async function GET(_req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const role = session.user.role?.toLowerCase();
        const userArchetype = normalizeArchetype(session.user.archetype);

        const where = role === "learner"
            ? {
                roadmap: userArchetype
                    ? {
                        archetype: {
                            equals: userArchetype,
                            mode: "insensitive" as const,
                        },
                    }
                    : undefined,
            }
            : undefined;

        const courses = await prisma.course.findMany({
            where,
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
                const { title, description, difficulty, contentType, contentUrl, content, duration } = body;

        const normalizedContentUrl = normalizeCourseContentUrl(contentType, contentUrl);

        if (contentType === "video" && contentUrl && !normalizedContentUrl) {
          return NextResponse.json({ error: "Please provide a valid YouTube link for video courses." }, { status: 400 });
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

        const course = await prisma.course.create({
            data: {
                title,
                description,
                difficulty,
                contentType,
                contentUrl: normalizedContentUrl,
                content: contentType === "text" ? (content ?? null) : null,
                duration: typeof duration === "number" ? duration : null,
            }
        });

        return NextResponse.json(course);
    } catch (_error) {
        return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
    }
}
