-- Enable pgcrypto for bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed Users with bcrypt-hashed passwords (password123)
INSERT INTO "User" ("id", "name", "email", "password", "role", "archetype", "supervisorId", "totalLearningHours", "createdAt", "updatedAt")
VALUES 
  ('user-admin-001', 'Admin User', 'admin@archetype.local', crypt('password123', gen_salt('bf', 10)), 'admin', 'Architect', NULL, 0, NOW(), NOW()),
  ('user-supervisor-001', 'Supervisor User', 'supervisor@archetype.local', crypt('password123', gen_salt('bf', 10)), 'supervisor', 'Catalyst', NULL, 0, NOW(), NOW()),
  ('user-learner-001', 'Alice Learner', 'learner1@archetype.local', crypt('password123', gen_salt('bf', 10)), 'learner', 'Maker', 'user-supervisor-001', 24, NOW(), NOW()),
  ('user-learner-002', 'Bob Learner', 'learner2@archetype.local', crypt('password123', gen_salt('bf', 10)), 'learner', 'Catalyst', 'user-supervisor-001', 18, NOW(), NOW()),
  ('user-candidate-001', 'Charlie Candidate', 'candidate@archetype.local', crypt('password123', gen_salt('bf', 10)), 'candidate', NULL, NULL, 0, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "password" = EXCLUDED."password", "updatedAt" = NOW();

-- Seed Roadmaps
INSERT INTO "Roadmap" ("id", "name", "archetype", "description", "createdAt", "updatedAt")
VALUES
  ('roadmap-fullstack', 'Full Stack Development', 'Maker', 'Complete full-stack web development learning path covering frontend, backend, and databases.', NOW(), NOW()),
  ('roadmap-leadership', 'Technical Leadership', 'Catalyst', 'Develop leadership skills for technical teams, including communication, mentoring, and strategy.', NOW(), NOW()),
  ('roadmap-architecture', 'System Architecture', 'Architect', 'Learn to design scalable, maintainable systems with modern architecture patterns.', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed Modules
INSERT INTO "Module" ("id", "roadmapId", "name", "description", "order", "createdAt", "updatedAt")
VALUES
  ('mod-frontend', 'roadmap-fullstack', 'Frontend Fundamentals', 'HTML, CSS, JavaScript, and React basics', 1, NOW(), NOW()),
  ('mod-backend', 'roadmap-fullstack', 'Backend Development', 'Node.js, Express, and API design', 2, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed Courses
INSERT INTO "Course" ("id", "title", "description", "difficulty", "roadmapId", "moduleId", "contentType", "contentUrl", "duration", "createdAt", "updatedAt")
VALUES
  ('course-react-fundamentals', 'React Fundamentals', 'Master the core concepts of React including components, JSX, state, props, and hooks. Build interactive web applications from scratch.', 'beginner', 'roadmap-fullstack', 'mod-frontend', 'video', 'https://youtube.com/embed/w7ejDZ8SWv8', 120, NOW(), NOW()),
  ('course-advanced-react', 'Advanced React Patterns', 'Explore advanced React patterns like render props, custom hooks, context API, and performance optimization.', 'advanced', 'roadmap-fullstack', 'mod-frontend', 'video', 'https://youtube.com/embed/0aJ8j1HqDJE', 180, NOW(), NOW()),
  ('course-nodejs-express', 'Node.js & Express', 'Build scalable backend applications with Node.js and Express. Learn routing, middleware, databases, authentication.', 'intermediate', 'roadmap-fullstack', 'mod-backend', 'video', 'https://youtube.com/embed/ENrzD6iR81g', 150, NOW(), NOW()),
  ('course-typescript', 'TypeScript for JavaScript Developers', 'Learn TypeScript and add type safety to your JavaScript projects. Understand interfaces, generics, decorators.', 'intermediate', 'roadmap-fullstack', 'mod-frontend', 'video', 'https://youtube.com/embed/gieEQFIfgYc', 140, NOW(), NOW()),
  ('course-postgresql', 'Database Design with PostgreSQL', 'Master relational database design and SQL. Learn about normalization, relationships, queries, indexing.', 'intermediate', 'roadmap-fullstack', 'mod-backend', 'video', 'https://youtube.com/embed/9Pzj7Aj25lw', 160, NOW(), NOW()),
  ('course-system-design', 'System Design Fundamentals', 'Learn system design principles for building scalable applications. Covers architecture, databases, caching.', 'advanced', 'roadmap-architecture', NULL, 'video', 'https://youtube.com/embed/lXv5mM2F81o', 240, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed Enrollments
INSERT INTO "CourseEnrollment" ("id", "userId", "courseId", "status", "progress", "enrolledAt")
VALUES
  ('enroll-001', 'user-learner-001', 'course-react-fundamentals', 'completed', 100, NOW()),
  ('enroll-002', 'user-learner-001', 'course-advanced-react', 'in_progress', 45, NOW()),
  ('enroll-003', 'user-learner-001', 'course-nodejs-express', 'in_progress', 30, NOW()),
  ('enroll-004', 'user-learner-002', 'course-react-fundamentals', 'in_progress', 60, NOW()),
  ('enroll-005', 'user-learner-002', 'course-typescript', 'in_progress', 20, NOW()),
  ('enroll-006', 'user-candidate-001', 'course-react-fundamentals', 'in_progress', 15, NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed Tests
INSERT INTO "Test" ("id", "courseId", "title", "description", "type", "timeLimit", "attemptLimit", "passingScore", "questions", "gradingType", "createdAt", "updatedAt")
VALUES
  ('test-react-basics', 'course-react-fundamentals', 'React Fundamentals Assessment', 'Test your knowledge of React basics', 'mcq', 30, 3, 70, '[{"id":1,"type":"mcq","question":"What is React?","options":["A UI library for building user interfaces","A backend framework","A database management tool","A CSS preprocessor"],"correctAnswer":0},{"id":2,"type":"mcq","question":"What is JSX?","options":["JavaScript XML - a syntax extension","A Java library","A testing framework","A CSS-in-JS solution"],"correctAnswer":0},{"id":3,"type":"mcq","question":"What hook is used for side effects?","options":["useState","useEffect","useContext","useReducer"],"correctAnswer":1},{"id":4,"type":"mcq","question":"What is the virtual DOM?","options":["A lightweight copy of the real DOM","A browser extension","A server-side rendering technique","A CSS animation framework"],"correctAnswer":0}]', 'auto', NOW(), NOW()),
  ('test-typescript', 'course-typescript', 'TypeScript Proficiency Test', 'Evaluate your TypeScript understanding', 'mcq', 45, 2, 70, '[{"id":1,"type":"mcq","question":"What is the main benefit of TypeScript?","options":["Static type checking","Faster runtime performance","Smaller bundle size","Built-in state management"],"correctAnswer":0},{"id":2,"type":"mcq","question":"What keyword defines an interface?","options":["class","type","interface","struct"],"correctAnswer":2},{"id":3,"type":"mcq","question":"What does the any type represent?","options":["A type that can hold any value","A type for arrays only","A type for functions only","A type for null values"],"correctAnswer":0}]', 'auto', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed Test Results
INSERT INTO "TestResult" ("id", "userId", "testId", "score", "status", "answers", "feedback", "attemptNumber", "startedAt", "submittedAt", "createdAt")
VALUES
  ('result-001', 'user-learner-001', 'test-react-basics', 85, 'graded', '[0,0,1,0]', 'Great job! You passed with 85%.', 1, NOW(), NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed Learning Sessions
INSERT INTO "LearningSession" ("id", "userId", "status", "startTime", "endTime", "durationMinutes", "createdAt")
VALUES
  ('session-001', 'user-learner-001', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 hours', 120, NOW()),
  ('session-002', 'user-learner-001', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '3 hours', 180, NOW()),
  ('session-003', 'user-learner-002', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '90 minutes', 90, NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed Skills
INSERT INTO "Skill" ("id", "userId", "name", "description", "level", "proficiency", "createdAt", "updatedAt")
VALUES
  ('skill-001', 'user-learner-001', 'React', 'React.js library proficiency', 4, 80, NOW(), NOW()),
  ('skill-002', 'user-learner-001', 'TypeScript', 'TypeScript language proficiency', 3, 65, NOW(), NOW()),
  ('skill-003', 'user-learner-002', 'JavaScript', 'JavaScript fundamentals', 3, 70, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Seed Archetypes
INSERT INTO "Archetype" ("id", "name", "description", "createdAt", "updatedAt")
VALUES
  ('arch-001', 'Maker', 'Maker archetype - represents a distinct learning and working style.', NOW(), NOW()),
  ('arch-002', 'Architect', 'Architect archetype - represents a distinct learning and working style.', NOW(), NOW()),
  ('arch-003', 'Catalyst', 'Catalyst archetype - represents a distinct learning and working style.', NOW(), NOW()),
  ('arch-004', 'Refiner', 'Refiner archetype - represents a distinct learning and working style.', NOW(), NOW()),
  ('arch-005', 'Craftsman', 'Craftsman archetype - represents a distinct learning and working style.', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;