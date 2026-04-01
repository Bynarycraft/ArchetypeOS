import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ testId: string }> }
) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;

    try {
        const body = await req.json();
        const { answers, startedAt } = body; // answers = { "0": 1, "1": 0 } - index based

        if (!answers || (typeof answers !== "object" && !Array.isArray(answers))) {
            return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
        }

        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: { course: true }
        });

        if (!test) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        if (role !== "admin" && role !== "supervisor") {
            const enrollment = await prisma.courseEnrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: session.user.id,
                        courseId: test.courseId,
                    },
                },
                select: { id: true },
            });

            if (!enrollment) {
                return NextResponse.json({ error: "Enroll in this course before submitting this assessment." }, { status: 403 });
            }
        }

        let score = 0;
        let status: "submitted" | "graded" = "submitted";
        interface Question {
            correct?: number;
            correctAnswer?: number;
        }

        const questions: Question[] = typeof test.questions === "string"
            ? JSON.parse(test.questions)
            : ((test.questions as unknown as Question[]) || []);

        // 1. Grading logic for MCQ
        if (test.type.toLowerCase() === "mcq" && questions.length > 0) {
            let correctCount = 0;
            questions.forEach((q, idx) => {
                const expected = q.correct ?? q.correctAnswer;
                if (answers[idx] === expected) {
                    correctCount++;
                }
            });
            score = Math.round((correctCount / questions.length) * 100);
            status = "graded";
        }

        const passingScore = test.passingScore || 70;

        // 2. Save result
        const inProgressAttempt = await prisma.testResult.findFirst({
            where: {
                testId,
                userId: session.user.id,
                status: { in: ["in_progress", "IN_PROGRESS"] },
            },
            orderBy: { createdAt: "desc" },
            select: { id: true, attemptNumber: true },
        });

        const resolvedStartedAt = startedAt ? new Date(startedAt) : new Date();

        const result = inProgressAttempt
            ? await prisma.testResult.update({
                where: { id: inProgressAttempt.id },
                data: {
                    answers: JSON.stringify(answers),
                    score,
                    status,
                    startedAt: resolvedStartedAt,
                    submittedAt: new Date(),
                }
            })
            : await prisma.testResult.create({
                data: {
                    testId,
                    userId: session.user.id,
                    answers: JSON.stringify(answers),
                    score,
                    status,
                    startedAt: resolvedStartedAt,
                    submittedAt: new Date(),
                }
            });

        // 3. Logic: If passed, mark course enrollment as "completed"
        if (score >= passingScore) {
            await prisma.courseEnrollment.updateMany({
                where: {
                    userId: session.user.id,
                    courseId: test.courseId
                },
                data: {
                    status: "completed",
                    progress: 100,
                    completedAt: new Date()
                }
            });

            const existing = await prisma.auditLog.findFirst({
                where: {
                    userId: session.user.id,
                    action: "certificate",
                    targetId: test.courseId,
                },
            });

            if (!existing) {
                await prisma.auditLog.create({
                    data: {
                        userId: session.user.id,
                        action: "certificate",
                        targetType: "course",
                        targetId: test.courseId,
                        details: "Course completed",
                    },
                });
            }

        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 });
    }
}
