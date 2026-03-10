import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  // Only admin can seed, OR if no users exist yet
  const userCount = await prisma.user.count();
  if (userCount > 0 && (!session || role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // 1. Create users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.upsert({
      where: { email: "admin@archetypeos.com" },
      update: {},
      create: {
        name: "Sarah Admin",
        email: "admin@archetypeos.com",
        password: hashedPassword,
        role: "admin",
        archetype: "Architect",
      },
    });

    const supervisor = await prisma.user.upsert({
      where: { email: "supervisor@archetypeos.com" },
      update: {},
      create: {
        name: "Mark Supervisor",
        email: "supervisor@archetypeos.com",
        password: hashedPassword,
        role: "supervisor",
        archetype: "Catalyst",
      },
    });

    const learner1 = await prisma.user.upsert({
      where: { email: "alice@archetypeos.com" },
      update: {},
      create: {
        name: "Alice Johnson",
        email: "alice@archetypeos.com",
        password: hashedPassword,
        role: "learner",
        archetype: "Maker",
        supervisorId: supervisor.id,
        totalLearningHours: 24,
      },
    });

    const learner2 = await prisma.user.upsert({
      where: { email: "bob@archetypeos.com" },
      update: {},
      create: {
        name: "Bob Williams",
        email: "bob@archetypeos.com",
        password: hashedPassword,
        role: "learner",
        archetype: "Catalyst",
        supervisorId: supervisor.id,
        totalLearningHours: 18,
      },
    });

    const candidate = await prisma.user.upsert({
      where: { email: "candidate@archetypeos.com" },
      update: {},
      create: {
        name: "Charlie Candidate",
        email: "candidate@archetypeos.com",
        password: hashedPassword,
        role: "candidate",
        archetype: null,
      },
    });

    // 2. Create Roadmaps
    const roadmapFullStack = await prisma.roadmap.upsert({
      where: { id: "roadmap-fullstack" },
      update: {},
      create: {
        id: "roadmap-fullstack",
        name: "Full Stack Development",
        archetype: "Maker",
        description: "Complete full-stack web development learning path covering frontend, backend, and databases.",
      },
    });

    const roadmapLeadership = await prisma.roadmap.upsert({
      where: { id: "roadmap-leadership" },
      update: {},
      create: {
        id: "roadmap-leadership",
        name: "Technical Leadership",
        archetype: "Catalyst",
        description: "Develop leadership skills for technical teams, including communication, mentoring, and strategy.",
      },
    });

    const roadmapArchitecture = await prisma.roadmap.upsert({
      where: { id: "roadmap-architecture" },
      update: {},
      create: {
        id: "roadmap-architecture",
        name: "System Architecture",
        archetype: "Architect",
        description: "Learn to design scalable, maintainable systems with modern architecture patterns.",
      },
    });

    // 3. Create Modules
    const moduleFrontend = await prisma.module.upsert({
      where: { id: "mod-frontend" },
      update: {},
      create: {
        id: "mod-frontend",
        roadmapId: roadmapFullStack.id,
        name: "Frontend Fundamentals",
        description: "HTML, CSS, JavaScript, and React basics",
        order: 1,
      },
    });

    const moduleBackend = await prisma.module.upsert({
      where: { id: "mod-backend" },
      update: {},
      create: {
        id: "mod-backend",
        roadmapId: roadmapFullStack.id,
        name: "Backend Development",
        description: "Node.js, Express, and API design",
        order: 2,
      },
    });

    // 4. Create Courses
    const course1 = await prisma.course.upsert({
      where: { id: "course-react-fundamentals" },
      update: {},
      create: {
        id: "course-react-fundamentals",
        title: "React Fundamentals",
        description: "Master the core concepts of React including components, JSX, state, props, and hooks. Build interactive web applications from scratch.",
        difficulty: "beginner",
        roadmapId: roadmapFullStack.id,
        moduleId: moduleFrontend.id,
        contentType: "video",
        contentUrl: "https://youtube.com/embed/w7ejDZ8SWv8",
        duration: 120,
      },
    });

    const course2 = await prisma.course.upsert({
      where: { id: "course-advanced-react" },
      update: {},
      create: {
        id: "course-advanced-react",
        title: "Advanced React Patterns",
        description: "Explore advanced React patterns like render props, custom hooks, context API, and performance optimization. For developers who know React basics.",
        difficulty: "advanced",
        roadmapId: roadmapFullStack.id,
        moduleId: moduleFrontend.id,
        contentType: "video",
        contentUrl: "https://youtube.com/embed/0aJ8j1HqDJE",
        duration: 180,
      },
    });

    const course3 = await prisma.course.upsert({
      where: { id: "course-nodejs-express" },
      update: {},
      create: {
        id: "course-nodejs-express",
        title: "Node.js & Express",
        description: "Build scalable backend applications with Node.js and Express. Learn routing, middleware, databases, authentication, and deployment.",
        difficulty: "intermediate",
        roadmapId: roadmapFullStack.id,
        moduleId: moduleBackend.id,
        contentType: "video",
        contentUrl: "https://youtube.com/embed/ENrzD6iR81g",
        duration: 150,
      },
    });

    const course4 = await prisma.course.upsert({
      where: { id: "course-typescript" },
      update: {},
      create: {
        id: "course-typescript",
        title: "TypeScript for JavaScript Developers",
        description: "Learn TypeScript and add type safety to your JavaScript projects. Understand interfaces, generics, decorators, and more.",
        difficulty: "intermediate",
        roadmapId: roadmapFullStack.id,
        moduleId: moduleFrontend.id,
        contentType: "video",
        contentUrl: "https://youtube.com/embed/gieEQFIfgYc",
        duration: 140,
      },
    });

    const course5 = await prisma.course.upsert({
      where: { id: "course-postgresql" },
      update: {},
      create: {
        id: "course-postgresql",
        title: "Database Design with PostgreSQL",
        description: "Master relational database design and SQL. Learn about normalization, relationships, queries, indexing, and optimization.",
        difficulty: "intermediate",
        roadmapId: roadmapFullStack.id,
        moduleId: moduleBackend.id,
        contentType: "video",
        contentUrl: "https://youtube.com/embed/9Pzj7Aj25lw",
        duration: 160,
      },
    });

    const course6 = await prisma.course.upsert({
      where: { id: "course-system-design" },
      update: {},
      create: {
        id: "course-system-design",
        title: "System Design Fundamentals",
        description: "Learn system design principles for building scalable applications. Covers architecture, databases, caching, and distributed systems.",
        difficulty: "advanced",
        roadmapId: roadmapArchitecture.id,
        moduleId: null,
        contentType: "video",
        contentUrl: "https://youtube.com/embed/lXv5mM2F81o",
        duration: 240,
      },
    });

    // 5. Create Enrollments
    const enrollments = [
      { userId: learner1.id, courseId: course1.id, status: "completed", progress: 100 },
      { userId: learner1.id, courseId: course2.id, status: "in_progress", progress: 45 },
      { userId: learner1.id, courseId: course3.id, status: "in_progress", progress: 30 },
      { userId: learner2.id, courseId: course1.id, status: "in_progress", progress: 60 },
      { userId: learner2.id, courseId: course4.id, status: "in_progress", progress: 20 },
      { userId: candidate.id, courseId: course1.id, status: "in_progress", progress: 15 },
    ];

    for (const enrollment of enrollments) {
      await prisma.courseEnrollment.upsert({
        where: {
          userId_courseId: {
            userId: enrollment.userId,
            courseId: enrollment.courseId,
          },
        },
        update: { status: enrollment.status, progress: enrollment.progress },
        create: enrollment,
      });
    }

    // 6. Create Tests
    const test1 = await prisma.test.upsert({
      where: { id: "test-react-basics" },
      update: {},
      create: {
        id: "test-react-basics",
        courseId: course1.id,
        title: "React Fundamentals Assessment",
        description: "Test your knowledge of React basics",
        type: "mcq",
        timeLimit: 30,
        attemptLimit: 3,
        passingScore: 70,
        questions: JSON.stringify([
          {
            id: 1,
            type: "mcq",
            question: "What is React?",
            options: ["A UI library for building user interfaces", "A backend framework", "A database management tool", "A CSS preprocessor"],
            correctAnswer: 0,
          },
          {
            id: 2,
            type: "mcq",
            question: "What is JSX?",
            options: ["JavaScript XML - a syntax extension for JavaScript", "A Java library", "A testing framework", "A CSS-in-JS solution"],
            correctAnswer: 0,
          },
          {
            id: 3,
            type: "mcq",
            question: "What hook is used for side effects in React?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            correctAnswer: 1,
          },
          {
            id: 4,
            type: "mcq",
            question: "What is the virtual DOM?",
            options: [
              "A lightweight copy of the real DOM for efficient updates",
              "A browser extension",
              "A server-side rendering technique",
              "A CSS animation framework"
            ],
            correctAnswer: 0,
          },
        ]),
        gradingType: "auto",
      },
    });

    await prisma.test.upsert({
      where: { id: "test-typescript" },
      update: {},
      create: {
        id: "test-typescript",
        courseId: course4.id,
        title: "TypeScript Proficiency Test",
        description: "Evaluate your TypeScript understanding",
        type: "mcq",
        timeLimit: 45,
        attemptLimit: 2,
        passingScore: 70,
        questions: JSON.stringify([
          {
            id: 1,
            type: "mcq",
            question: "What is the main benefit of TypeScript over JavaScript?",
            options: ["Static type checking", "Faster runtime performance", "Smaller bundle size", "Built-in state management"],
            correctAnswer: 0,
          },
          {
            id: 2,
            type: "mcq",
            question: "What keyword is used to define an interface in TypeScript?",
            options: ["class", "type", "interface", "struct"],
            correctAnswer: 2,
          },
          {
            id: 3,
            type: "mcq",
            question: "What does the 'any' type represent in TypeScript?",
            options: [
              "A type that can hold any value, bypassing type checking",
              "A type for arrays only",
              "A type for functions only",
              "A type for null values"
            ],
            correctAnswer: 0,
          },
        ]),
        gradingType: "auto",
      },
    });

    // 7. Create Test Results
    await prisma.testResult.upsert({
      where: { userId_testId_attemptNumber: { userId: learner1.id, testId: test1.id, attemptNumber: 1 } },
      update: {},
      create: {
        userId: learner1.id,
        testId: test1.id,
        score: 85,
        status: "graded",
        answers: JSON.stringify([0, 0, 1, 0]),
        feedback: "Great job! You passed with 85%.",
        gradedAt: new Date(),
        submittedAt: new Date(),
        attemptNumber: 1,
      },
    });

    // 8. Create Learning Sessions
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    await prisma.learningSession.create({
      data: {
        userId: learner1.id,
        status: "completed",
        startTime: yesterday,
        endTime: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000),
        durationMinutes: 120,
      },
    });

    await prisma.learningSession.create({
      data: {
        userId: learner1.id,
        status: "completed",
        startTime: twoDaysAgo,
        endTime: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000),
        durationMinutes: 180,
      },
    });

    await prisma.learningSession.create({
      data: {
        userId: learner2.id,
        status: "completed",
        startTime: yesterday,
        endTime: new Date(yesterday.getTime() + 1.5 * 60 * 60 * 1000),
        durationMinutes: 90,
      },
    });

    // 9. Create Skills
    await prisma.skill.upsert({
      where: { userId_name: { userId: learner1.id, name: "React" } },
      update: {},
      create: {
        userId: learner1.id,
        name: "React",
        description: "React.js library proficiency",
        level: 4,
        proficiency: 80,
      },
    });

    await prisma.skill.upsert({
      where: { userId_name: { userId: learner1.id, name: "TypeScript" } },
      update: {},
      create: {
        userId: learner1.id,
        name: "TypeScript",
        description: "TypeScript language proficiency",
        level: 3,
        proficiency: 65,
      },
    });

    await prisma.skill.upsert({
      where: { userId_name: { userId: learner2.id, name: "JavaScript" } },
      update: {},
      create: {
        userId: learner2.id,
        name: "JavaScript",
        description: "JavaScript fundamentals",
        level: 3,
        proficiency: 70,
      },
    });

    // 10. Create Archetypes
    const archetypes = ["Maker", "Architect", "Catalyst", "Refiner", "Craftsman"];
    for (const name of archetypes) {
      await prisma.archetype.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `${name} archetype - represents a distinct learning and working style.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        users: 5,
        courses: 6,
        roadmaps: 3,
        tests: 2,
        enrollments: enrollments.length,
        archetypes: archetypes.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database", details: String(error) }, { status: 500 });
  }
}
