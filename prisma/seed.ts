import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create Admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@archetype.local' },
    update: {
      name: 'Admin User',
      password: hashedAdminPassword,
      role: 'admin',
      archetype: 'Architect'
    },
    create: {
      name: 'Admin User',
      email: 'admin@archetype.local',
      password: hashedAdminPassword,
      role: 'admin',
      archetype: 'Architect'
    }
  })
  console.log('✓ Created admin user:', admin.email)

  // Create Supervisor user
  const hashedSupervisorPassword = await bcrypt.hash('supervisor123', 10)
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@archetype.local' },
    update: {
      name: 'Supervisor User',
      password: hashedSupervisorPassword,
      role: 'supervisor',
      archetype: 'Catalyst'
    },
    create: {
      name: 'Supervisor User',
      email: 'supervisor@archetype.local',
      password: hashedSupervisorPassword,
      role: 'supervisor',
      archetype: 'Catalyst'
    }
  })
  console.log('✓ Created supervisor user:', supervisor.email)

  // Create Learner users
  const hashedLearnerPassword = await bcrypt.hash('learner123', 10)
  const learner1 = await prisma.user.upsert({
    where: { email: 'learner1@archetype.local' },
    update: {
      name: 'Alice Learner',
      password: hashedLearnerPassword,
      role: 'learner',
      archetype: 'Maker',
      supervisorId: supervisor.id,
      totalLearningHours: 24
    },
    create: {
      name: 'Alice Learner',
      email: 'learner1@archetype.local',
      password: hashedLearnerPassword,
      role: 'learner',
      archetype: 'Maker',
      supervisorId: supervisor.id,
      totalLearningHours: 24
    }
  })
  console.log('✓ Created learner user:', learner1.email)

  const learner2 = await prisma.user.upsert({
    where: { email: 'learner2@archetype.local' },
    update: {
      name: 'Bob Learner',
      password: hashedLearnerPassword,
      role: 'learner',
      archetype: 'Catalyst',
      supervisorId: supervisor.id,
      totalLearningHours: 18
    },
    create: {
      name: 'Bob Learner',
      email: 'learner2@archetype.local',
      password: hashedLearnerPassword,
      role: 'learner',
      archetype: 'Catalyst',
      supervisorId: supervisor.id,
      totalLearningHours: 18
    }
  })
  console.log('✓ Created learner user:', learner2.email)

  const learner3 = await prisma.user.upsert({
    where: { email: 'learner3@archetype.local' },
    update: {
      name: 'Dana Learner',
      password: hashedLearnerPassword,
      role: 'learner',
      archetype: 'Maker',
      supervisorId: supervisor.id,
      totalLearningHours: 12
    },
    create: {
      name: 'Dana Learner',
      email: 'learner3@archetype.local',
      password: hashedLearnerPassword,
      role: 'learner',
      archetype: 'Maker',
      supervisorId: supervisor.id,
      totalLearningHours: 12
    }
  })
  console.log('✓ Created learner user:', learner3.email)

  const learner4 = await prisma.user.upsert({
    where: { email: 'learner4@archetype.local' },
    update: {
      name: 'Evan Learner',
      password: hashedLearnerPassword,
      role: 'learner',
      archetype: 'Architect',
      supervisorId: supervisor.id,
      totalLearningHours: 4
    },
    create: {
      name: 'Evan Learner',
      email: 'learner4@archetype.local',
      password: hashedLearnerPassword,
      role: 'learner',
      archetype: 'Architect',
      supervisorId: supervisor.id,
      totalLearningHours: 4
    }
  })
  console.log('✓ Created learner user:', learner4.email)

  // Create Candidate users
  const hashedCandidatePassword = await bcrypt.hash('candidate123', 10)
  const candidate1 = await prisma.user.upsert({
    where: { email: 'candidate@archetype.local' },
    update: {
      name: 'Charlie Candidate',
      password: hashedCandidatePassword,
      role: 'candidate',
      archetype: null
    },
    create: {
      name: 'Charlie Candidate',
      email: 'candidate@archetype.local',
      password: hashedCandidatePassword,
      role: 'candidate',
      archetype: null
    }
  })
  console.log('✓ Created candidate user:', candidate1.email)

  // Create Archetypes
  const _architectureArchetype = await prisma.archetype.upsert({
    where: { name: 'Architect' },
    update: {},
    create: {
      name: 'Architect',
      description: 'System designers and architects'
    }
  })

  const _makerArchetype = await prisma.archetype.upsert({
    where: { name: 'Maker' },
    update: {},
    create: {
      name: 'Maker',
      description: 'Hands-on builders and developers'
    }
  })

  const _catalystArchetype = await prisma.archetype.upsert({
    where: { name: 'Catalyst' },
    update: {},
    create: {
      name: 'Catalyst',
      description: 'Change agents and innovators'
    }
  })

  console.log('✓ Created archetypes')

  // Create Roadmaps (one dedicated path per supported archetype)
  const makerRoadmap = await prisma.roadmap.upsert({
    where: { id: 'roadmap-maker' },
    update: {
      name: 'Maker Implementation Path',
      archetype: 'Maker',
      description: 'Hands-on build path focused on implementation and shipping features'
    },
    create: {
      id: 'roadmap-maker',
      name: 'Maker Implementation Path',
      archetype: 'Maker',
      description: 'Hands-on build path focused on implementation and shipping features'
    }
  })

  const architectRoadmap = await prisma.roadmap.upsert({
    where: { id: 'roadmap-architect' },
    update: {
      name: 'Architect Systems Path',
      archetype: 'Architect',
      description: 'Systems, scalability, and design decisions for long-term platform health'
    },
    create: {
      id: 'roadmap-architect',
      name: 'Architect Systems Path',
      archetype: 'Architect',
      description: 'Systems, scalability, and design decisions for long-term platform health'
    }
  })

  const catalystRoadmap = await prisma.roadmap.upsert({
    where: { id: 'roadmap-catalyst' },
    update: {
      name: 'Catalyst Product Path',
      archetype: 'Catalyst',
      description: 'Leadership, enablement, and product-focused execution for change agents'
    },
    create: {
      id: 'roadmap-catalyst',
      name: 'Catalyst Product Path',
      archetype: 'Catalyst',
      description: 'Leadership, enablement, and product-focused execution for change agents'
    }
  })

  console.log('✓ Created archetype roadmaps')

  // Create Modules
  const makerModuleFoundation = await prisma.module.upsert({
    where: { id: 'module-maker-1' },
    update: {
      roadmapId: makerRoadmap.id,
      name: 'Frontend Foundations',
      description: 'UI fundamentals, component systems, and client-side engineering',
      order: 1
    },
    create: {
      id: 'module-maker-1',
      roadmapId: makerRoadmap.id,
      name: 'Frontend Foundations',
      description: 'UI fundamentals, component systems, and client-side engineering',
      order: 1
    }
  })

  const makerModuleDelivery = await prisma.module.upsert({
    where: { id: 'module-maker-2' },
    update: {
      roadmapId: makerRoadmap.id,
      name: 'Backend and Delivery',
      description: 'API engineering, quality practices, and delivery readiness',
      order: 2
    },
    create: {
      id: 'module-maker-2',
      roadmapId: makerRoadmap.id,
      name: 'Backend and Delivery',
      description: 'API engineering, quality practices, and delivery readiness',
      order: 2
    }
  })

  const architectModuleData = await prisma.module.upsert({
    where: { id: 'module-architect-1' },
    update: {
      roadmapId: architectRoadmap.id,
      name: 'Data and Persistence',
      description: 'Relational modeling, data integrity, and performance under scale',
      order: 1
    },
    create: {
      id: 'module-architect-1',
      roadmapId: architectRoadmap.id,
      name: 'Data and Persistence',
      description: 'Relational modeling, data integrity, and performance under scale',
      order: 1
    }
  })

  const architectModuleScale = await prisma.module.upsert({
    where: { id: 'module-architect-2' },
    update: {
      roadmapId: architectRoadmap.id,
      name: 'Distributed Systems',
      description: 'Tradeoffs, architecture patterns, and reliability strategy',
      order: 2
    },
    create: {
      id: 'module-architect-2',
      roadmapId: architectRoadmap.id,
      name: 'Distributed Systems',
      description: 'Tradeoffs, architecture patterns, and reliability strategy',
      order: 2
    }
  })

  const catalystModuleDesign = await prisma.module.upsert({
    where: { id: 'module-catalyst-1' },
    update: {
      roadmapId: catalystRoadmap.id,
      name: 'Design and Experience',
      description: 'Systematic UX patterns, clarity, and design consistency',
      order: 1
    },
    create: {
      id: 'module-catalyst-1',
      roadmapId: catalystRoadmap.id,
      name: 'Design and Experience',
      description: 'Systematic UX patterns, clarity, and design consistency',
      order: 1
    }
  })

  const catalystModuleLeadership = await prisma.module.upsert({
    where: { id: 'module-catalyst-2' },
    update: {
      roadmapId: catalystRoadmap.id,
      name: 'Leadership and Change',
      description: 'Product discovery, facilitation, and stakeholder alignment',
      order: 2
    },
    create: {
      id: 'module-catalyst-2',
      roadmapId: catalystRoadmap.id,
      name: 'Leadership and Change',
      description: 'Product discovery, facilitation, and stakeholder alignment',
      order: 2
    }
  })

  console.log('✓ Created archetype modules')

  // Create Courses
  const course1 = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleFoundation.id
    },
    create: {
      id: 'course-1',
      title: 'React Fundamentals',
      description: 'Master the core concepts of React. Learn about components, JSX, state, props, and hooks in this comprehensive beginner course. Build your first interactive web applications with React.',
      difficulty: 'beginner',
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleFoundation.id,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      duration: 120,
      version: '1.0'
    }
  })

  const course2 = await prisma.course.upsert({
    where: { id: 'course-2' },
    update: {
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleFoundation.id
    },
    create: {
      id: 'course-2',
      title: 'Advanced React Patterns',
      description: 'Take your React skills to the next level. Explore advanced patterns like render props, custom hooks, context API, and performance optimization techniques. Perfect for developers who already know React basics.',
      difficulty: 'advanced',
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleFoundation.id,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
      duration: 180,
      version: '1.0'
    }
  })

  const course3 = await prisma.course.upsert({
    where: { id: 'course-3' },
    update: {
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleDelivery.id
    },
    create: {
      id: 'course-3',
      title: 'Node.js & Express Fundamentals',
      description: 'Build scalable backend applications with Node.js and Express. Learn about routing, middleware, databases, authentication, and deployment. This course is essential for full-stack developers.',
      difficulty: 'intermediate',
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleDelivery.id,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      duration: 150,
      version: '1.0'
    }
  })

  const course4 = await prisma.course.upsert({
    where: { id: 'course-4' },
    update: {
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=30LWjhZzg50',
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleFoundation.id
    },
    create: {
      id: 'course-4',
      title: 'TypeScript for JavaScript Developers',
      description: 'Learn TypeScript and add type safety to your JavaScript projects. Understand interfaces, generics, decorators, and more. A must-have skill for modern web development.',
      difficulty: 'intermediate',
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleFoundation.id,
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=30LWjhZzg50',
      duration: 140,
      version: '1.0'
    }
  })

  const postgresqlContent = `# Database Design with PostgreSQL

Relational databases remain the backbone of most production systems. PostgreSQL is one of the most powerful open-source relational database systems available, combining rock-solid reliability with advanced features that rival commercial alternatives.

## What Is a Relational Database?

A relational database organizes data into tables — each with rows and columns. Tables relate to each other through foreign keys, enabling you to model complex real-world systems cleanly. Unlike document stores, relational databases enforce structure, making them ideal for financial records, user management, and any domain where data integrity matters.

## Normalization

Normalization is the process of structuring tables to reduce redundancy and improve data integrity. First Normal Form (1NF) requires that every column holds atomic values — no comma-separated lists hidden in a text field. Second Normal Form (2NF) requires that every non-key column depends on the whole primary key, not just part of it. Third Normal Form (3NF) goes further: every non-key column must depend only on the primary key, removing transitive dependencies that cause update anomalies.

## Writing Effective SQL Queries

SELECT statements are the most common database operations. Always specify the columns you need rather than using SELECT *, and filter with WHERE before joining large tables. Use EXPLAIN ANALYZE to understand query plans before adding indexes.

JOINs connect related tables. INNER JOIN returns rows with matches in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right, filling in NULLs where no match exists.

Aggregate functions such as COUNT, SUM, GROUP BY, and HAVING let you summarize large datasets. Window functions such as RANK, ROW_NUMBER, and LAG extend analytics scoped to partitions of the result set without requiring subqueries.

## Indexes and Performance

Indexes are separate data structures that speed up reads at the cost of slower writes. B-tree indexes are the default and work for equality and range queries. GIN indexes excel at full-text search and JSONB columns. Partial indexes cover only a subset of rows, keeping them small and efficient for queries with selective filter conditions.

Never over-index. Every index must be updated on every write, so unnecessary indexes slow inserts and updates without improving reads.

## Transactions and ACID

PostgreSQL supports full ACID compliance. Wrap related operations in a transaction using BEGIN and COMMIT so they succeed or fail atomically. If something goes wrong, ROLLBACK undoes the entire transaction. Use SAVEPOINT within long transactions to create partial rollback points without abandoning all previous work.

## Getting Started

Install PostgreSQL locally, then connect with psql or a GUI like pgAdmin or TablePlus. Create a database, define your schema with CREATE TABLE statements, and start writing queries. The Pagila sample database — which models a DVD rental store — is an excellent starting point for exploring joins, aggregations, and indexes together.`

  const _course5 = await prisma.course.upsert({
    where: { id: 'course-5' },
    update: {
      contentType: 'text',
      contentUrl: null,
      roadmapId: architectRoadmap.id,
      moduleId: architectModuleData.id
    },
    create: {
      id: 'course-5',
      title: 'Database Design with PostgreSQL',
      description: 'Master relational database design and SQL. Learn about normalization, relationships, queries, and optimization. Perfect for backend and full-stack developers.',
      difficulty: 'intermediate',
      roadmapId: architectRoadmap.id,
      moduleId: architectModuleData.id,
      contentType: 'text',
      duration: 160,
      version: '1.0'
    }
  })

  const systemDesignContent = `# System Design Interview Prep

System design interviews evaluate whether you can reason about large-scale systems, make tradeoffs under constraints, and communicate architecture decisions clearly. The goal is not to produce a perfect design. The goal is to demonstrate structured thinking.

## Start with requirements

Always begin by clarifying functional and non-functional requirements. Ask what the system must do, who will use it, and what scale the interviewer expects. For example: how many daily active users, what latency target, what data must be durable, and what operations are read-heavy versus write-heavy.

Strong candidates do not jump straight into databases or queues. They first define the shape of the problem.

## Build the high-level design first

Sketch the major components before drilling into internals. A typical starting point includes clients, a load balancer, stateless application servers, a primary datastore, a cache, and object storage. If the system handles asynchronous work such as email, media processing, or analytics ingestion, add a message queue and background workers.

At this stage, explain data flow in simple language. A request enters through the load balancer, hits an application server, checks cache, reads or writes the database, and returns a response. The interviewer needs to see that you can map the request lifecycle cleanly.

## Know your scaling tools

Horizontal scaling adds more machines. Vertical scaling increases capacity on a single machine. Stateless services are easier to scale horizontally because requests can be routed to any healthy instance.

Caching reduces pressure on the database and improves latency. Use it for hot reads, session data, or precomputed views. But caches introduce invalidation complexity, so always explain how stale data is handled.

Replication improves read throughput and resilience. Sharding distributes writes across multiple partitions when one database can no longer handle throughput or dataset size alone.

## Reliability and tradeoffs

Every design decision has a cost. Strong answers explicitly name tradeoffs: consistency versus availability, latency versus durability, write amplification versus query speed, implementation speed versus operational complexity.

If you add a queue, explain why eventual consistency is acceptable. If you choose denormalized data, explain what duplication you accept and how you will reconcile it.

## Common interview pattern

Most system design interviews follow a repeatable structure:
- Clarify scope and traffic expectations.
- Estimate scale with rough numbers.
- Propose a high-level architecture.
- Identify bottlenecks.
- Deep dive into data model, scaling, caching, and failure handling.
- Summarize tradeoffs and future improvements.

This structure matters as much as the design itself. A clear framework makes your reasoning easier to follow and gives the interviewer confidence that you can lead architecture discussions in real teams.

## What to practice

Practice designing URL shorteners, chat systems, news feeds, file storage platforms, notification services, and rate limiters. These cover the core building blocks that recur across many interview problems.

When studying, compare multiple valid solutions rather than memorizing a single architecture. Interviewers are evaluating judgment, not recall.`

  const _course6 = await prisma.course.upsert({
    where: { id: 'course-6' },
    update: {
      contentType: 'link',
      contentUrl: 'https://martinfowler.com/tags/architecture.html',
      roadmapId: architectRoadmap.id,
      moduleId: architectModuleScale.id,
    },
    create: {
      id: 'course-6',
      title: 'System Design Interview Prep',
      description: 'Prepare for system design interviews at top tech companies. Learn about architecture, scalability, databases, and distributed systems. Advanced course for experienced developers.',
      difficulty: 'advanced',
      roadmapId: architectRoadmap.id,
      moduleId: architectModuleScale.id,
      contentType: 'link',
      contentUrl: 'https://martinfowler.com/tags/architecture.html',
      duration: 240,
      version: '1.0'
    }
  })

  const uiPatternsContent = `# UI System Patterns

Good interface systems are not collections of random components. They are deliberate decisions about hierarchy, spacing, typography, contrast, rhythm, and reuse. The fastest way to make a product feel trustworthy is to make it visually consistent.

## Visual hierarchy

Hierarchy tells users what matters first. Strong hierarchy comes from size, weight, spacing, and contrast. A page title should dominate supporting copy. Primary actions should stand out more than secondary actions. Supporting labels should be visible without competing with the main content.

When everything is loud, nothing is important.

## Spacing systems

Consistent spacing makes screens feel designed instead of assembled. Use a spacing scale such as 4, 8, 12, 16, 24, 32, and 48 pixels. Reusing these values creates rhythm between sections, cards, fields, and buttons.

Spacing is not empty space. It is structure. It groups related items, separates unrelated ones, and gives the eye room to parse content.

## Card patterns

Cards work best when they contain one coherent unit of information. A strong card usually has four layers: container, heading, supporting text, and action. If a card contains too many unrelated actions, it stops being a card and becomes an overloaded dashboard fragment.

Use borders, surface color, and shadow intentionally. Too much shadow makes interfaces feel noisy. Too little separation makes them collapse into each other.

## Typography

Typography carries both tone and structure. Headlines should communicate emphasis. Body text should optimize for readability first. Avoid long line lengths, weak contrast, and tiny labels. A readable interface usually feels more premium than one with aggressive styling but poor text discipline.

## Reusable system thinking

System design in UI means defining patterns once and reusing them everywhere: button variants, input styles, spacing rules, panel headers, empty states, and status badges. The goal is not sameness for its own sake. The goal is predictability.

When a user learns one pattern, they should be able to transfer that understanding across the rest of the product.`

  await prisma.course.upsert({
    where: { id: 'course-7' },
    update: {
      contentType: 'image',
      contentUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1280&q=80',
      roadmapId: catalystRoadmap.id,
      moduleId: catalystModuleDesign.id,
    },
    create: {
      id: 'course-7',
      title: 'UI System Patterns (Image Notes)',
      description: 'A visual guide to spacing, hierarchy, and card systems used in production SaaS products.',
      difficulty: 'beginner',
      roadmapId: catalystRoadmap.id,
      moduleId: catalystModuleDesign.id,
      contentType: 'image',
      contentUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1280&q=80',
      duration: 90,
      version: '1.0'
    }
  })

  const cleanCodeContent = `# Clean Code Principles\n\nEvery developer has opened a codebase and immediately thought: who wrote this? Clean code is not about aesthetics \u2014 it is about professionalism. Code that is easy to read, understand, and change costs less to maintain, and fewer bugs escape into production when intent is clear rather than obscured.\n\n## Meaningful Names\n\nThe most impactful thing you can do for code quality is choose meaningful names. A variable called d communicates nothing. A variable called elapsedTimeInDays communicates intent immediately. Functions should be named as verbs: getUser, calculateTax, sendNotification. Classes should be named as nouns: UserRepository, PaymentProcessor, InventoryItem.\n\nAvoid abbreviations unless they are universally understood in your domain. Prefer length over ambiguity. If you need a comment to explain what a name means, the name is wrong.\n\n## Functions Should Do One Thing\n\nFunctions should do one thing and do it well. If a function has more than three or four parameters, consider passing a configuration object instead. Functions longer than 20 lines often hide multiple responsibilities. When you find yourself writing a comment inside a function body that says "Phase 2" or "Step B", that is a signal to extract the second section into its own named function.\n\nSide effects in functions create invisible coupling. A function called getUserEmail should not also log to the database or increment a counter. Separate commands from queries: functions that return values should not change state, and functions that change state should return nothing.\n\n## Comments\n\nThe best comment is the code that does not need one. Comments lie \u2014 they are rarely updated when code changes. The one legitimate use of a comment is to explain why something works the way it does, when the reason would not be obvious to the next developer.\n\nDelete commented-out code without hesitation. Version control exists precisely to preserve history.\n\n## Error Handling\n\nDo not return null when you can return an empty collection or a sensible default. Null is the source of the most common runtime errors across all programming languages. Throw exceptions with messages that name the specific problem and include actionable context \u2014 not just "error" or "something went wrong."\n\nHandle errors at the level where you have enough context to do something useful. Catching an exception just to log it and rethrow adds noise. Let errors propagate until the layer that can actually recover or report meaningfully to the user.\n\n## SOLID Principles\n\nThe Single Responsibility Principle states that a class or module should have one, and only one, reason to change. This does not mean one function \u2014 it means one cohesive responsibility owned by one part of the system.\n\nThe Open-Closed Principle asks you to design software that is open for extension but closed for modification. New behavior should be addable without editing existing code, typically through interfaces, inheritance, or composition.\n\nDependency Inversion tells us to depend on abstractions, not concretions. High-level business rules should not know about database drivers or HTTP clients. They should speak to interfaces, and infrastructure wires up the implementations.\n\n## Refactoring\n\nRefactoring is a structured process of improving the internal structure of code without changing its observable behavior. The most important precondition for safe refactoring is a test suite that runs quickly and covers the behavior you are changing.\n\nUseful techniques include Extract Method, Rename Variable, Extract Class, and Introduce Parameter Object. Learn them by name so you can communicate clearly with teammates about what you are doing and why.\n\nLeave the code cleaner than you found it. The Boy Scout Rule applied to software: check in code that is slightly better than what you checked out.`

  await prisma.course.upsert({
    where: { id: 'course-8' },
    update: {
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleDelivery.id,
    },
    create: {
      id: 'course-8',
      title: 'Clean Code Principles and Best Practices',
      description: 'Write code that is easy to read, change, and maintain. Covers naming conventions, SOLID principles, error handling, and refactoring techniques used by professional software teams.',
      difficulty: 'beginner',
      roadmapId: makerRoadmap.id,
      moduleId: makerModuleDelivery.id,
      contentType: 'text',
      duration: 60,
      version: '1.0'
    }
  })

  const productDiscoveryContent = `# Product Discovery for Catalyst Leaders

Great catalysts reduce waste by validating assumptions before teams over-build. Product discovery combines problem framing, rapid learning loops, and evidence-based decisions.

## Start with outcomes, not features

Before proposing a feature, define the behavior change you need from users. Tie that behavior to a measurable business outcome.

## Discovery loop

Use a simple loop: frame the problem, form a hypothesis, run a lightweight experiment, then decide. Strong teams run this loop continuously rather than once per quarter.

## Experiment types

Use interviews for qualitative context, prototypes for usability, and instrumentation for behavioral proof. Prefer low-cost experiments before engineering-heavy bets.

## Decision quality

Document assumptions and results so the team can revisit why decisions were made. This strengthens alignment with design, engineering, and stakeholders.`

  const _course9 = await prisma.course.upsert({
    where: { id: 'course-9' },
    update: {
      contentType: 'text',
      contentUrl: null,
      roadmapId: catalystRoadmap.id,
      moduleId: catalystModuleLeadership.id,
    },
    create: {
      id: 'course-9',
      title: 'Product Discovery and Experimentation',
      description: 'Lead product discovery loops with experiments, hypotheses, and measurable outcomes.',
      difficulty: 'intermediate',
      roadmapId: catalystRoadmap.id,
      moduleId: catalystModuleLeadership.id,
      contentType: 'text',
      duration: 75,
      version: '1.0'
    }
  })

  const stakeholderContent = `# Stakeholder Facilitation for Delivery Catalysts

Catalysts translate between teams to keep execution moving. Facilitation is not presentation; it is structured alignment under constraints.

## Meeting architecture

Define objective, decision owner, participants, and expected output before each session. End every meeting with clear owners and deadlines.

## Conflict navigation

Surface disagreement early and frame tradeoffs explicitly. Keep debates anchored to outcomes, data, and constraints.

## Execution hygiene

Use decision logs, action trackers, and weekly review cadences to prevent ambiguity drift across teams.`

  const _course10 = await prisma.course.upsert({
    where: { id: 'course-10' },
    update: {
      contentType: 'text',
      contentUrl: null,
      roadmapId: catalystRoadmap.id,
      moduleId: catalystModuleLeadership.id,
    },
    create: {
      id: 'course-10',
      title: 'Stakeholder Facilitation and Delivery Rhythm',
      description: 'Run high-clarity stakeholder sessions and keep cross-functional delivery aligned.',
      difficulty: 'intermediate',
      roadmapId: catalystRoadmap.id,
      moduleId: catalystModuleLeadership.id,
      contentType: 'text',
      duration: 70,
      version: '1.0'
    }
  })

  console.log('✓ Created courses')

  // Create Course Enrollments
  const enrollments = [
    { userId: learner1.id, courseId: course1.id, status: 'completed', progress: 100 },
    { userId: learner1.id, courseId: course2.id, status: 'in_progress', progress: 45 },
    { userId: learner1.id, courseId: course3.id, status: 'in_progress', progress: 30 },
    { userId: learner2.id, courseId: 'course-7', status: 'in_progress', progress: 60 },
    { userId: learner2.id, courseId: _course9.id, status: 'in_progress', progress: 20 },
    { userId: learner2.id, courseId: _course10.id, status: 'started', progress: 5 },
    { userId: learner3.id, courseId: course4.id, status: 'in_progress', progress: 72 },
    { userId: learner4.id, courseId: _course6.id, status: 'started', progress: 12 },
    { userId: candidate1.id, courseId: course1.id, status: 'started', progress: 15 }
  ]

  for (const enrollment of enrollments) {
    await prisma.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId: enrollment.userId,
          courseId: enrollment.courseId
        }
      },
      update: {},
      create: enrollment
    })
  }

  console.log('✓ Created course enrollments')

  // Create Tests
  const test1 = await prisma.test.upsert({
    where: { id: 'test-1' },
    update: {},
    create: {
      id: 'test-1',
      courseId: course1.id,
      title: 'React Fundamentals Test',
      description: 'Test your knowledge of React basics',
      type: 'mcq',
      timeLimit: 60,
      attemptLimit: 3,
      passingScore: 70,
      questions: JSON.stringify([
        {
          id: 1,
          type: 'mcq',
          question: 'What is React?',
          options: ['A UI library', 'A framework', 'A database', 'A language'],
          correctAnswer: 0
        },
        {
          id: 2,
          type: 'mcq',
          question: 'What is JSX?',
          options: ['JavaScript XML', 'Java Syntax', 'Just X', 'JSON X'],
          correctAnswer: 0
        }
      ]),
      gradingType: 'auto'
    }
  })

  console.log('✓ Created tests')

  // Create Test Results
  await prisma.testResult.upsert({
    where: {
      userId_testId_attemptNumber: {
        userId: learner1.id,
        testId: test1.id,
        attemptNumber: 1,
      }
    },
    update: {},
    create: {
      userId: learner1.id,
      testId: test1.id,
      score: 85,
      status: 'graded',
      answers: JSON.stringify([0, 0]),
      feedback: 'Great job! You passed the test.',
      gradedAt: new Date(),
      submittedAt: new Date(),
      attemptNumber: 1
    }
  })

  console.log('✓ Created test results')

  // Create Learning Sessions
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  await prisma.learningSession.upsert({
    where: { id: 'session-1' },
    update: {},
    create: {
      id: 'session-1',
      userId: learner1.id,
      status: 'completed',
      startTime: yesterday,
      endTime: new Date(yesterday.getTime() + 6 * 60 * 60 * 1000),
      durationMinutes: 360
    }
  })

  await prisma.learningSession.upsert({
    where: { id: 'session-2' },
    update: {},
    create: {
      id: 'session-2',
      userId: learner2.id,
      status: 'completed',
      startTime: yesterday,
      endTime: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000),
      durationMinutes: 240
    }
  })

  await prisma.learningSession.upsert({
    where: { id: 'session-3' },
    update: {},
    create: {
      id: 'session-3',
      userId: learner3.id,
      status: 'active',
      startTime: new Date(now.getTime() - 90 * 60 * 1000),
      durationMinutes: 90
    }
  })

  console.log('✓ Created learning sessions')

  // Create Skills
  await prisma.skill.upsert({
    where: { userId_name: { userId: learner1.id, name: 'React' } },
    update: {},
    create: {
      userId: learner1.id,
      name: 'React',
      description: 'React.js library',
      level: 4,
      proficiency: 80,
      evidenceCourses: JSON.stringify([course1.id])
    }
  })

  await prisma.skill.upsert({
    where: { userId_name: { userId: learner1.id, name: 'TypeScript' } },
    update: {},
    create: {
      userId: learner1.id,
      name: 'TypeScript',
      description: 'TypeScript language',
      level: 3,
      proficiency: 65,
      evidenceCourses: JSON.stringify([course2.id])
    }
  })

  console.log('✓ Created skills')

  // Create Lessons for key courses so learner flows have content structure
  const lessons = [
    {
      id: 'lesson-course-1-1',
      courseId: course1.id,
      order: 1,
      title: 'React Components and JSX',
      description: 'Understand component composition and JSX syntax.',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      duration: 35,
    },
    {
      id: 'lesson-course-1-2',
      courseId: course1.id,
      order: 2,
      title: 'State, Props, and Data Flow',
      description: 'Learn unidirectional data flow and state management basics.',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      duration: 40,
    },
    {
      id: 'lesson-course-1-3',
      courseId: course1.id,
      order: 3,
      title: 'Hooks and Side Effects',
      description: 'Use useState and useEffect in practical patterns.',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      duration: 45,
    },
    {
      id: 'lesson-course-7-1',
      courseId: 'course-7',
      order: 1,
      title: 'Hierarchy and Typography',
      description: 'Establish visual hierarchy and readable type scales.',
      contentType: 'image',
      contentUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1280&q=80',
      duration: 25,
    },
    {
      id: 'lesson-course-7-2',
      courseId: 'course-7',
      order: 2,
      title: 'Spacing and Layout Rhythm',
      description: 'Use spacing tokens to improve scannability.',
      contentType: 'image',
      contentUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1280&q=80',
      duration: 20,
    },
  ]

  try {
    for (const lesson of lessons) {
      await prisma.lesson.upsert({
        where: { id: lesson.id },
        update: {
          courseId: lesson.courseId,
          order: lesson.order,
          title: lesson.title,
          description: lesson.description,
          contentType: lesson.contentType,
          contentUrl: lesson.contentUrl,
          duration: lesson.duration,
        },
        create: lesson,
      })
    }

    console.log('✓ Created lessons')
  } catch (error) {
    console.warn('⚠ Skipped lesson seed (table likely missing):', error instanceof Error ? error.message : error)
  }

  // Create additional tests to cover graded + pending review scenarios
  const test2 = await prisma.test.upsert({
    where: { id: 'test-2' },
    update: {},
    create: {
      id: 'test-2',
      courseId: course2.id,
      title: 'Advanced React Patterns Practical',
      description: 'Manual review assessment for advanced React patterns.',
      type: 'essay',
      timeLimit: 90,
      attemptLimit: 2,
      passingScore: 75,
      questions: JSON.stringify([
        {
          id: 1,
          type: 'essay',
          question: 'Explain when to use context versus composition in React.',
        },
        {
          id: 2,
          type: 'essay',
          question: 'Describe a performance optimization strategy and tradeoffs.',
        }
      ]),
      gradingType: 'manual',
    }
  })

  const test3 = await prisma.test.upsert({
    where: { id: 'test-3' },
    update: {},
    create: {
      id: 'test-3',
      courseId: 'course-7',
      title: 'UI Pattern Recognition Quiz',
      description: 'Quick MCQ assessment for UI hierarchy and spacing.',
      type: 'mcq',
      timeLimit: 30,
      attemptLimit: 3,
      passingScore: 70,
      questions: JSON.stringify([
        {
          id: 1,
          type: 'mcq',
          question: 'Which element most strongly communicates hierarchy?',
          options: ['Padding only', 'Heading weight and size', 'Random color changes', 'Icon count'],
          correctAnswer: 1,
        },
        {
          id: 2,
          type: 'mcq',
          question: 'What spacing approach improves consistency?',
          options: ['Arbitrary values', 'Token-based spacing scale', 'No spacing system', 'Zero margins'],
          correctAnswer: 1,
        }
      ]),
      gradingType: 'auto',
    }
  })

  console.log('✓ Created additional tests')

  // Create multiple assessment outcomes: graded pass, graded fail, submitted pending
  await prisma.testResult.upsert({
    where: {
      userId_testId_attemptNumber: {
        userId: learner1.id,
        testId: test2.id,
        attemptNumber: 1,
      }
    },
    update: {},
    create: {
      userId: learner1.id,
      testId: test2.id,
      score: 0,
      status: 'submitted',
      answers: JSON.stringify({
        0: 'Use composition first, context for shared global concerns.',
        1: 'Memoization and splitting expensive renders improve responsiveness.',
      }),
      startedAt: new Date(yesterday.getTime() + 90 * 60 * 1000),
      submittedAt: new Date(yesterday.getTime() + 130 * 60 * 1000),
      attemptNumber: 1,
    }
  })

  await prisma.testResult.upsert({
    where: {
      userId_testId_attemptNumber: {
        userId: learner2.id,
        testId: test3.id,
        attemptNumber: 1,
      }
    },
    update: {},
    create: {
      userId: learner2.id,
      testId: test3.id,
      score: 50,
      status: 'graded',
      answers: JSON.stringify([0, 1]),
      feedback: 'Review hierarchy fundamentals and retake.',
      gradedBy: supervisor.id,
      gradedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      submittedAt: new Date(now.getTime() - 13 * 60 * 60 * 1000),
      attemptNumber: 1,
    }
  })

  await prisma.testResult.upsert({
    where: {
      userId_testId_attemptNumber: {
        userId: learner2.id,
        testId: test3.id,
        attemptNumber: 2,
      }
    },
    update: {},
    create: {
      userId: learner2.id,
      testId: test3.id,
      score: 100,
      status: 'graded',
      answers: JSON.stringify([1, 1]),
      feedback: 'Great improvement. Solid pattern recognition.',
      gradedBy: supervisor.id,
      gradedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      submittedAt: new Date(now.getTime() - 7 * 60 * 60 * 1000),
      attemptNumber: 2,
    }
  })

  await prisma.testResult.upsert({
    where: {
      userId_testId_attemptNumber: {
        userId: learner3.id,
        testId: test2.id,
        attemptNumber: 1,
      }
    },
    update: {},
    create: {
      userId: learner3.id,
      testId: test2.id,
      score: 0,
      status: 'submitted',
      answers: JSON.stringify({
        0: 'Composition reduces prop drilling in feature shells.',
        1: 'Profiling helps identify wasted renders and expensive effects.',
      }),
      startedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      submittedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      attemptNumber: 1,
    }
  })

  await prisma.testResult.upsert({
    where: {
      userId_testId_attemptNumber: {
        userId: learner4.id,
        testId: test1.id,
        attemptNumber: 1,
      }
    },
    update: {},
    create: {
      userId: learner4.id,
      testId: test1.id,
      score: 62,
      status: 'graded',
      answers: JSON.stringify([0, 1]),
      feedback: 'Solid understanding, but review hooks and state flow.',
      gradedBy: supervisor.id,
      gradedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      submittedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      attemptNumber: 1,
    }
  })

  console.log('✓ Created expanded test results')

  // Keep enrollment progress aligned with successful completions
  await prisma.courseEnrollment.updateMany({
    where: { userId: learner2.id, courseId: 'course-7' },
    data: { status: 'completed', progress: 100, completedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) }
  })

  // Create reflections for supervisor coaching flows
  await prisma.reflection.upsert({
    where: { learningSessionId: 'session-1' },
    update: {
      userId: learner1.id,
      text: 'Implemented reusable hooks and reduced duplicate UI logic in the React module.',
      mood: 'focused',
      courseId: course2.id,
    },
    create: {
      userId: learner1.id,
      learningSessionId: 'session-1',
      text: 'Implemented reusable hooks and reduced duplicate UI logic in the React module.',
      mood: 'focused',
      courseId: course2.id,
    }
  })

  await prisma.reflection.upsert({
    where: { learningSessionId: 'session-2' },
    update: {
      userId: learner2.id,
      text: 'Practiced UI hierarchy and spacing rules; second quiz attempt improved significantly.',
      mood: 'motivated',
      courseId: 'course-7',
    },
    create: {
      userId: learner2.id,
      learningSessionId: 'session-2',
      text: 'Practiced UI hierarchy and spacing rules; second quiz attempt improved significantly.',
      mood: 'motivated',
      courseId: 'course-7',
    }
  })

  console.log('✓ Created reflections')

  // Add supervisor comments on reflections
  try {
    const reflectionOne = await prisma.reflection.findUnique({ where: { learningSessionId: 'session-1' } })
    const reflectionTwo = await prisma.reflection.findUnique({ where: { learningSessionId: 'session-2' } })

    if (reflectionOne) {
      await prisma.reflectionComment.upsert({
        where: { id: 'reflection-comment-1' },
        update: {
          reflectionId: reflectionOne.id,
          senderId: supervisor.id,
          text: 'Strong progress. Next step is to document tradeoffs in your hook design.',
        },
        create: {
          id: 'reflection-comment-1',
          reflectionId: reflectionOne.id,
          senderId: supervisor.id,
          text: 'Strong progress. Next step is to document tradeoffs in your hook design.',
        }
      })
    }

    if (reflectionTwo) {
      await prisma.reflectionComment.upsert({
        where: { id: 'reflection-comment-2' },
        update: {
          reflectionId: reflectionTwo.id,
          senderId: supervisor.id,
          text: 'Excellent resilience on retake. Keep reinforcing spacing rules with examples.',
        },
        create: {
          id: 'reflection-comment-2',
          reflectionId: reflectionTwo.id,
          senderId: supervisor.id,
          text: 'Excellent resilience on retake. Keep reinforcing spacing rules with examples.',
        }
      })
    }

    console.log('✓ Created reflection comments')
  } catch (error) {
    console.warn('⚠ Skipped reflection comment seed (table likely missing):', error instanceof Error ? error.message : error)
  }

  // Create directional feedback entries (supervisor <-> learners)
  try {
    await prisma.feedback.upsert({
      where: { id: 'feedback-1' },
      update: {
        senderId: supervisor.id,
        receiverId: learner1.id,
        courseId: course2.id,
        type: 'coaching',
        text: 'Good architectural reasoning. Improve clarity in performance tradeoff explanations.',
        rating: 4,
      },
      create: {
        id: 'feedback-1',
        senderId: supervisor.id,
        receiverId: learner1.id,
        courseId: course2.id,
        type: 'coaching',
        text: 'Good architectural reasoning. Improve clarity in performance tradeoff explanations.',
        rating: 4,
        isPrivate: false,
      }
    })

    await prisma.feedback.upsert({
      where: { id: 'feedback-2' },
      update: {
        senderId: learner2.id,
        receiverId: supervisor.id,
        courseId: 'course-7',
        type: 'comment',
        text: 'The feedback on hierarchy made the retake much easier. Thank you.',
        rating: 5,
      },
      create: {
        id: 'feedback-2',
        senderId: learner2.id,
        receiverId: supervisor.id,
        courseId: 'course-7',
        type: 'comment',
        text: 'The feedback on hierarchy made the retake much easier. Thank you.',
        rating: 5,
        isPrivate: false,
      }
    })

    console.log('✓ Created feedback threads')
  } catch (error) {
    console.warn('⚠ Skipped feedback seed (table likely missing):', error instanceof Error ? error.message : error)
  }

  // Create notifications to make inboxes realistic
  const notifications = [
    {
      id: 'notification-1',
      userId: learner1.id,
      title: 'Assessment submitted',
      message: 'Your Advanced React Patterns Practical assessment is awaiting review.',
      type: 'info',
      priority: 'normal',
      actionUrl: '/tests',
      isRead: false,
    },
    {
      id: 'notification-2',
      userId: learner2.id,
      title: 'Assessment graded',
      message: 'Your UI Pattern Recognition Quiz retake has been graded: 100%.',
      type: 'success',
      priority: 'normal',
      actionUrl: '/tests',
      isRead: false,
    },
    {
      id: 'notification-3',
      userId: supervisor.id,
      title: 'Pending grading queue',
      message: 'There is 1 submitted assessment pending review.',
      type: 'warning',
      priority: 'high',
      actionUrl: '/supervisor',
      isRead: false,
    },
    {
      id: 'notification-4',
      userId: admin.id,
      title: 'Certificate issued',
      message: 'A new completion certificate was issued for UI Pattern Recognition Quiz.',
      type: 'success',
      priority: 'normal',
      actionUrl: '/admin/certificates',
      isRead: false,
    },
  ]

  try {
    for (const notification of notifications) {
      await prisma.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification,
      })
    }

    await prisma.notification.upsert({
      where: { id: 'notification-5' },
      update: {
        userId: learner3.id,
        title: 'Manual review pending',
        message: 'Your Advanced React Patterns Practical submission is waiting for supervisor grading.',
        type: 'warning',
        priority: 'high',
        actionUrl: '/tests',
        isRead: false,
      },
      create: {
        id: 'notification-5',
        userId: learner3.id,
        title: 'Manual review pending',
        message: 'Your Advanced React Patterns Practical submission is waiting for supervisor grading.',
        type: 'warning',
        priority: 'high',
        actionUrl: '/tests',
        isRead: false,
      }
    })

    console.log('✓ Created notifications')
  } catch (error) {
    console.warn('⚠ Skipped notification seed (table likely missing):', error instanceof Error ? error.message : error)
  }

  // Create certificate records for completed learners
  try {
    await prisma.certificate.upsert({
      where: { id: 'certificate-1' },
      update: {
        userId: learner1.id,
        courseId: course1.id,
        certificateNumber: 'CERT-ALICE-REACT-001',
        verificationCode: 'VERIFY-ALICE-REACT-001',
        isVerified: true,
      },
      create: {
        id: 'certificate-1',
        userId: learner1.id,
        courseId: course1.id,
        certificateNumber: 'CERT-ALICE-REACT-001',
        verificationCode: 'VERIFY-ALICE-REACT-001',
        issuedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        isVerified: true,
      }
    })

    await prisma.certificate.upsert({
      where: { id: 'certificate-2' },
      update: {
        userId: learner2.id,
        courseId: 'course-7',
        certificateNumber: 'CERT-BOB-UIPATTERN-001',
        verificationCode: 'VERIFY-BOB-UIPATTERN-001',
        isVerified: true,
      },
      create: {
        id: 'certificate-2',
        userId: learner2.id,
        courseId: 'course-7',
        certificateNumber: 'CERT-BOB-UIPATTERN-001',
        verificationCode: 'VERIFY-BOB-UIPATTERN-001',
        issuedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        isVerified: true,
      }
    })

    console.log('✓ Created certificates')
  } catch (error) {
    console.warn('⚠ Skipped certificate seed (table likely missing):', error instanceof Error ? error.message : error)
  }

  // Create audit logs for admin reporting and certificate timeline
  const auditEntries = [
    {
      id: 'audit-certificate-1',
      userId: learner1.id,
      action: 'certificate',
      targetType: 'course',
      targetId: course1.id,
      details: 'Course completed',
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    },
    {
      id: 'audit-certificate-2',
      userId: learner2.id,
      action: 'certificate',
      targetType: 'course',
      targetId: 'course-7',
      details: 'Course completed',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
    {
      id: 'audit-admin-tests-1',
      userId: admin.id,
      action: 'admin_test_create',
      targetType: 'test',
      targetId: test2.id,
      details: 'Created manual-review practical assessment',
      timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000),
    },
    {
      id: 'audit-supervisor-grade-1',
      userId: supervisor.id,
      action: 'supervisor_grade',
      targetType: 'test_result',
      targetId: test3.id,
      details: 'Graded UI Pattern Recognition retake',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    },
  ]

  try {
    for (const entry of auditEntries) {
      await prisma.auditLog.upsert({
        where: { id: entry.id },
        update: entry,
        create: entry,
      })
    }

    console.log('✓ Created audit logs')
  } catch (error) {
    console.warn('⚠ Skipped audit seed (table likely missing):', error instanceof Error ? error.message : error)
  }

  console.log('✓ Database seeded successfully!')
}

main()
  .catch(e => {
    console.error('Seed error:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
