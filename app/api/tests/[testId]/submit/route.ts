import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ testId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;

    try {
        const body = await req.json();
        const { answers } = body; // answers = { "0": 1, "1": 0 } - index based

        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: { course: true }
        });

        if (!test) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        let score = 0;
        let status: "SUBMITTED" | "GRADED" = "SUBMITTED";
        interface Question {
            correct: number;
        }

        const questions = (test.questions as unknown as Question[]) || [];

        // 1. Grading logic for MCQ
        if (test.type === "MCQ" && questions.length > 0) {
            let correctCount = 0;
            questions.forEach((q, idx) => {
                if (answers[idx] === q.correct) {
                    correctCount++;
                }
            });
            score = Math.round((correctCount / questions.length) * 100);
            status = "GRADED";
        }

        // 2. Save result
        const result = await prisma.testResult.create({
            data: {
                testId,
                userId: session.user.id,
                answers,
                score,
                status,
                submittedAt: new Date(),
            }
        });

        // 3. Logic: If passed, mark course enrollment as "completed"
        const passingScore = test.passingScore || 70;
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

            // 4. Update role to learner if candidate passed
            if (session.user.role === "candidate") {
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: { role: "LEARNER" }
                });
            }
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 });
    }
}
