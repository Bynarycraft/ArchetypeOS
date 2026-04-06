import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const getWeekStart = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || (role !== "supervisor" && role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const learners = await prisma.user.findMany({
      where: role === "supervisor" ? { supervisorId: session.user.id } : { role: { in: ["candidate", "learner"] } },
      select: { id: true, name: true, email: true },
    });

    const weekStart = getWeekStart().toISOString();

    const logs = await prisma.auditLog.findMany({
      where: {
        action: "weekly_goal",
        targetId: { in: learners.map((l: { id: string }) => l.id) },
      },
      orderBy: { timestamp: "desc" },
    });

    const latestByUser: Record<
      string,
      { goalMinutes: number; dueDate: string | null }
    > = {};

    logs.forEach((log: { targetId: string | null; details: string | null }) => {
      if (!log.targetId || latestByUser[log.targetId]) return;
      if (!log.details) return;
      try {
        const details = JSON.parse(log.details) as {
          goalMinutes?: number;
          weekStart?: string;
          dueDate?: string | null;
        };
        if (details.weekStart === weekStart && typeof details.goalMinutes === "number") {
          latestByUser[log.targetId] = {
            goalMinutes: details.goalMinutes,
            dueDate: typeof details.dueDate === "string" ? details.dueDate : null,
          };
        }
      } catch (_error) {
        return;
      }
    });

    const payload = learners.map((learner: { id: string; name: string | null; email: string | null }) => ({
      ...learner,
      goalMinutes: latestByUser[learner.id]?.goalMinutes || 0,
      dueDate: latestByUser[learner.id]?.dueDate || null,
    }));

    return NextResponse.json({ weekStart, learners: payload });
  } catch (error) {
    console.error("Fetch weekly goals error:", error);
    return NextResponse.json({ error: "Failed to fetch weekly goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || (role !== "supervisor" && role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { learnerId, goalMinutes, dueDate } = body || {};

    if (!learnerId || typeof goalMinutes !== "number") {
      return NextResponse.json({ error: "learnerId and goalMinutes are required" }, { status: 400 });
    }

    if (dueDate !== undefined && dueDate !== null && String(dueDate).trim().length > 0) {
      const parsedDueDate = new Date(String(dueDate));
      if (Number.isNaN(parsedDueDate.getTime())) {
        return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
      }
    }

    if (role === "supervisor") {
      const learner = await prisma.user.findUnique({
        where: { id: learnerId },
        select: { supervisorId: true },
      });

      if (!learner || learner.supervisorId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const weekStart = getWeekStart();
    const details = {
      goalMinutes,
      weekStart: weekStart.toISOString(),
      dueDate: dueDate ? String(dueDate) : null,
    };

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "weekly_goal",
        targetType: "user",
        targetId: learnerId,
        details: JSON.stringify(details),
      },
    });

    return NextResponse.json({ success: true, goalMinutes });
  } catch (error) {
    console.error("Update weekly goal error:", error);
    return NextResponse.json({ error: "Failed to update weekly goal" }, { status: 500 });
  }
}
