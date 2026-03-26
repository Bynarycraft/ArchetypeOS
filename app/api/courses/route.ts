import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizeCourseContentUrl } from "@/lib/content-url";
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
            return NextResponse.json({ error: "Please provide a valid YouTube link for video courses." }, { status: 400 });
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

        const course = await prisma.course.create({
            data: {
                title: normalizedTitle,
                description: normalizedDescription,
                difficulty: normalizedDifficulty,
                contentType: normalizedContentType,
                contentUrl: normalizedContentUrl,
                content: normalizedContent,
                duration: normalizedDuration,
            }
        });

        return NextResponse.json(course);
    } catch (error) {
        console.error("Create course error:", error);
        return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
    }
}
