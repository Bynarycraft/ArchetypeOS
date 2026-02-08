import { prisma } from "@/lib/prisma";

export type SkillNode = {
    subject: string;
    A: number; // User score
    B: number; // Class average (benchmark)
    fullMark: number;
};

export async function calculateSkillData(userId: string): Promise<SkillNode[]> {
    // 1. Fetch user test results
    const userResults = await prisma.testResult.findMany({
        where: { userId, status: "GRADED" },
        include: { test: true }
    });

    // Benchmarks are currently mocked for MVP

    // Group by "Subject" (using Test Title or Course Title for now)
    const skillMap = new Map<string, { userSum: number; userCount: number; globalSum: number; globalCount: number }>();

    // Process User Results
    userResults.forEach(r => {
        const subject = r.test.title.split(' ')[0] || "General";
        if (!skillMap.has(subject)) {
            skillMap.set(subject, { userSum: 0, userCount: 0, globalSum: 0, globalCount: 0 });
        }
        const entry = skillMap.get(subject)!;
        entry.userSum += (r.score || 0);
        entry.userCount += 1;
    });

    // Transform to Radar Chart format
    const data: SkillNode[] = [];

    skillMap.forEach((val, key) => {
        data.push({
            subject: key,
            A: val.userCount > 0 ? (val.userSum / val.userCount) : 0,
            B: 75, // Mock benchmark for MVP
            fullMark: 100
        });
    });

    // Add default nodes if empty
    if (data.length === 0) {
        return [
            { subject: "Coding", A: 0, B: 60, fullMark: 100 },
            { subject: "Design", A: 0, B: 70, fullMark: 100 },
            { subject: "Communication", A: 0, B: 80, fullMark: 100 },
            { subject: "Leadership", A: 0, B: 50, fullMark: 100 },
        ];
    }

    return data;
}
