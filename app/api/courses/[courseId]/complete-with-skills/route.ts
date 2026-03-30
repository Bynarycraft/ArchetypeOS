import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/courses/[courseId]/complete-and-track-skills
 * Mark course as completed and auto-generate skills
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId } = await params;

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        difficulty: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check enrollment
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    // Mark course as completed
    const completed = await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "completed",
        progress: 100,
        completedAt: new Date(),
      },
    });

    // Extract skill names from course title
    // E.g., "Advanced React & TypeScript" → ["React", "TypeScript"]
    const skillNames = extractSkillsFromCourseTitle(course.title);

    // Determine skill level based on difficulty
    const skillLevelMap: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };
    const skillLevel = skillLevelMap[course.difficulty.toLowerCase()] || 1;

    // Update or create skills
    for (const skillName of skillNames) {
      await prisma.skill.upsert({
        where: {
          userId_name: {
            userId: session.user.id,
            name: skillName,
          },
        },
        update: {
          level: { increment: 1 },
          proficiency: { increment: 20 },
          evidenceCourses: addToEvidenceList(
            skillName,
            courseId,
            (await prisma.skill.findFirst({
              where: { userId: session.user.id, name: skillName },
              select: { evidenceCourses: true },
            }))?.evidenceCourses ?? "[]"
          ),
          lastUpdated: new Date(),
        },
        create: {
          userId: session.user.id,
          name: skillName,
          description: `Proficiency in ${skillName}`,
          level: skillLevel,
          proficiency: Math.min(100, 25 * skillLevel),
          evidenceCourses: JSON.stringify([courseId]),
        },
      });
    }

    // Log the completion
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "COURSE_COMPLETED_WITH_SKILLS",
        targetType: "course",
        targetId: courseId,
        details: `Completed course "${course.title}" and acquired skills: ${skillNames.join(", ")}`,
      },
    });

    return NextResponse.json({
      success: true,
      enrollment: completed,
      skillsAcquired: skillNames,
    });
  } catch (error) {
    console.error("[courses/complete-and-track-skills] error:", error);
    return NextResponse.json({ error: "Failed to complete course and track skills" }, { status: 500 });
  }
}

/**
 * Extract potential skill names from course title
 */
function extractSkillsFromCourseTitle(title: string): string[] {
  // Common skills pattern matching
  const skillKeywords = [
    "react",
    "typescript",
    "nodejs",
    "python",
    "javascript",
    "java",
    "golang",
    "rust",
    "csharp",
    "vue",
    "angular",
    "svelte",
    "next",
    "nuxt",
    "express",
    "fastapi",
    "django",
    "spring",
    "fastapi",
    "docker",
    "kubernetes",
    "aws",
    "gcp",
    "azure",
    "git",
    "sql",
    "mongodb",
    "postgres",
    "redis",
    "graphql",
    "rest",
    "testing",
    "automation",
    "devops",
    "security",
    "performance",
    "architecture",
    "design",
    "ui",
    "ux",
    "figma",
    "css",
    "html",
    "web",
    "mobile",
    "ios",
    "android",
  ];

  const titleLower = title.toLowerCase();
  const found: string[] = [];

  for (const keyword of skillKeywords) {
    if (titleLower.includes(keyword) && !found.includes(keyword)) {
      found.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }

  // If no skills found, use generic title
  if (found.length === 0) {
    // Extract meaningful words from title
    const words = title.split(/[\s&,+\-()]+/).filter((w) => w.length > 3);
    found.push(...words.slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1)));
  }

  return found.slice(0, 3); // Maximum 3 skills per course
}

/**
 * Add course ID to evidence list (stored as JSON string)
 */
function addToEvidenceList(skill: string, courseId: string, existingEvidence: string): string {
  try {
    const evidence = JSON.parse(existingEvidence) || [];
    if (!evidence.includes(courseId)) {
      evidence.push(courseId);
    }
    return JSON.stringify(evidence);
  } catch {
    return JSON.stringify([courseId]);
  }
}
