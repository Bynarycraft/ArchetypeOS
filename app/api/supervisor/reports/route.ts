import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toCsvCell(value: string | number | null): string {
  const text = value == null ? "" : String(value);
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || (role !== "supervisor" && role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const learners = await prisma.user.findMany({
      where:
        role === "supervisor"
          ? { supervisorId: session.user.id, role: "learner" }
          : { role: "learner" },
      include: {
        courseEnrollments: {
          select: { progress: true, status: true },
        },
        dailyLearningSessions: {
          select: { durationMinutes: true, startTime: true },
        },
        testResults: {
          select: { score: true, submittedAt: true },
          where: { status: { notIn: ["in_progress", "IN_PROGRESS"] } },
        },
      },
      orderBy: { name: "asc" },
    });

    const header = [
      "Learner Name",
      "Email",
      "Courses Enrolled",
      "Courses Completed",
      "Average Course Progress",
      "Total Learning Hours",
      "Average Test Score",
      "Last Learning Session",
    ];

    const rows = learners.map((learner) => {
      const enrolled = learner.courseEnrollments.length;
      const completed = learner.courseEnrollments.filter((course) => course.status === "completed").length;
      const avgProgress =
        enrolled > 0
          ? Math.round(
              learner.courseEnrollments.reduce((sum, course) => sum + (course.progress || 0), 0) / enrolled,
            )
          : 0;

      const totalMinutes = learner.dailyLearningSessions.reduce(
        (sum, sessionItem) => sum + (sessionItem.durationMinutes || 0),
        0,
      );
      const totalHours = (totalMinutes / 60).toFixed(1);

      const avgScore =
        learner.testResults.length > 0
          ? Math.round(
              learner.testResults.reduce((sum, result) => sum + (result.score || 0), 0) / learner.testResults.length,
            )
          : null;

      const lastSession = learner.dailyLearningSessions
        .map((sessionItem) => sessionItem.startTime)
        .sort((a, b) => b.getTime() - a.getTime())[0];

      return [
        toCsvCell(learner.name || "Unnamed"),
        toCsvCell(learner.email || ""),
        toCsvCell(enrolled),
        toCsvCell(completed),
        toCsvCell(`${avgProgress}%`),
        toCsvCell(totalHours),
        toCsvCell(avgScore == null ? "N/A" : `${avgScore}%`),
        toCsvCell(lastSession ? lastSession.toISOString() : "Never"),
      ].join(",");
    });

    const csv = [header.map((value) => toCsvCell(value)).join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="supervisor-report-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Supervisor report error:", error);
    return NextResponse.json({ error: "Failed to generate supervisor report" }, { status: 500 });
  }
}
