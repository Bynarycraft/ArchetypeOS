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
        const role = session.user.role?.toLowerCase() || "candidate";
        const isManagerView = role === "supervisor" || role === "admin";

        const users = isManagerView
            ? await prisma.user.findMany({
                  where:
                      role === "supervisor"
                          ? { supervisorId: session.user.id, role: { in: ["learner", "candidate"] } }
                          : { role: { in: ["learner", "candidate"] } },
                  include: {
                      courseEnrollments: {
                          where: { status: "completed" },
                          include: { course: { include: { roadmap: true } } },
                      },
                      testResults: {
                          where: { status: { in: ["graded", "GRADED"] } },
                          include: { test: { include: { course: { include: { roadmap: true } } } } },
                      },
                  },
              })
            : await prisma.user.findMany({
                  where: { id: session.user.id },
                  include: {
                      courseEnrollments: {
                          where: { status: "completed" },
                          include: { course: { include: { roadmap: true } } },
                      },
                      testResults: {
                          where: { status: { in: ["graded", "GRADED"] } },
                          include: { test: { include: { course: { include: { roadmap: true } } } } },
                      },
                  },
              });

        if (users.length === 0) {
            return NextResponse.json([]);
        }

        const skillMap: Record<string, { total: number; count: number }> = {};

        for (const userData of users) {
            userData.testResults.forEach((result) => {
                const category = result.test.course.roadmap?.name || "General";
                if (!skillMap[category]) skillMap[category] = { total: 0, count: 0 };
                skillMap[category].total += (result.score || 0) / 20;
                skillMap[category].count++;
            });

            userData.courseEnrollments.forEach((enroll) => {
                const category = enroll.course.roadmap?.name || "General";
                if (!skillMap[category]) skillMap[category] = { total: 0, count: 0 };
                skillMap[category].total += 3.5;
                skillMap[category].count++;
            });
        }

        const calculatedSkills = Object.entries(skillMap).map(([name, data]) => ({
            name,
            level: Math.min(Math.round((data.total / data.count) * 10) / 10, 5),
        }));

        if (!isManagerView) {
            for (const skill of calculatedSkills) {
                await prisma.skill.upsert({
                    where: {
                        userId_name: {
                            userId: session.user.id,
                            name: skill.name,
                        },
                    },
                    update: { level: skill.level },
                    create: {
                        userId: session.user.id,
                        name: skill.name,
                        level: skill.level,
                    },
                });
            }
        }

        return NextResponse.json(calculatedSkills);
    } catch (error) {
        console.error("Skill aggregation error:", error);
        return NextResponse.json({ error: "Failed to calculate skills" }, { status: 500 });
    }
}
