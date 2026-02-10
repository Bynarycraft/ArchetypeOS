import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { durationMinutes, reflection } = await req.json();

        // Create a new learning session
        const learningSession = await prisma.learningSession.create({
            data: {
                userId: session.user.id,
                durationMinutes: durationMinutes,
                endTime: new Date(),
                reflection: reflection ? {
                    create: {
                        text: reflection,
                        userId: session.user.id
                    }
                } : undefined
            },
        });

        return NextResponse.json(learningSession);
    } catch (error) {
        console.error("Session log error:", error);
        return NextResponse.json({ error: "Failed to log session" }, { status: 500 });
    }
}

export async function GET(_req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sessions = await prisma.learningSession.findMany({
            where: {
                userId: session.user.id,
                startTime: {
                    gte: today
                }
            }
        });

        const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

        return NextResponse.json({
            todayMinutes: totalMinutes,
            goalMinutes: 360, // 6 hours
            sessionsCount: sessions.length
        });
    } catch (error) {
        console.error("Session stats error:", error);
        return NextResponse.json({ error: "Failed to fetch session stats" }, { status: 500 });
    }
}
