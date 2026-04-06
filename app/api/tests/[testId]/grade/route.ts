import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { promoteCandidateToLearnerIfPassed } from "@/lib/candidate-promotion";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || (role !== "supervisor" && role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { testId } = await params;
  const { resultId, score, feedback } = await req.json();

  if (!resultId || !Number.isFinite(score)) {
    return NextResponse.json({ error: "Missing grading fields" }, { status: 400 });
  }

  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: {
        passingScore: true,
        courseId: true,
        title: true,
        course: { select: { title: true } },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const result = await prisma.testResult.findFirst({
      where: {
        id: resultId,
        testId,
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const updated = await prisma.testResult.update({
      where: { id: result.id },
      data: {
        score,
        feedback: feedback || null,
        status: "graded",
        gradedBy: session.user.id,
        gradedAt: new Date(),
      },
    });

    if (score >= test.passingScore) {
      await promoteCandidateToLearnerIfPassed({
        userId: result.userId,
        courseId: test.courseId,
        testId,
        testTitle: test.title,
        courseTitle: test.course.title,
        score,
        passingScore: test.passingScore,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Grade submission error:", error);
    return NextResponse.json({ error: "Failed to grade result" }, { status: 500 });
  }
}
