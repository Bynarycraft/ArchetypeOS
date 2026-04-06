import { prisma } from "@/lib/prisma";

type PromoteCandidateArgs = {
  userId: string;
  courseId: string;
  testId: string;
  testTitle: string;
  courseTitle: string;
  score: number;
  passingScore: number;
};

export async function promoteCandidateToLearnerIfPassed({
  userId,
  courseId,
  testId,
  testTitle,
  courseTitle,
  score,
  passingScore,
}: PromoteCandidateArgs) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!user || user.role?.toLowerCase() !== "candidate" || score < passingScore) {
    return { promoted: false };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "learner", status: "active" },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Candidate Approved",
      message: `You passed ${testTitle} for ${courseTitle}. Your account is now active as a learner.`,
      type: "success",
      priority: "high",
      actionUrl: "/results",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "candidate_promoted",
      targetType: "user",
      targetId: userId,
      details: JSON.stringify({
        courseId,
        testId,
        score,
        passingScore,
        source: "assessment_pass",
      }),
    },
  });

  return {
    promoted: true,
    userName: user.name,
  };
}