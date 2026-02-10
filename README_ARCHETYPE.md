# ArchetypeOS - Internal Talent Intelligence Platform

A comprehensive full-stack learning, testing, and talent management system designed for organizations implementing a 12-hour daily culture (6 hours learning + 6 hours work).

## Overview

ArchetypeOS is an MVP web application that enables:
- **Candidate Onboarding**: Pre-hiring test for new candidates
- **Course & Roadmap Management**: Modular learning paths by archetype
- **Testing & Assessments**: Auto-graded MCQs and manual grading for complex tasks
- **Learning Session Tracking**: Clock-in/out system with 6-hour daily goals
- **Reflections & Feedback**: Daily journaling and peer mentorship
- **Analytics & Intelligence**: Organization-wide and individual dashboards
- **Skill Intelligence**: Auto-generated skill graphs and proficiency tracking
- **Role-Based Access Control**: Candidates, Learners, Supervisors, Admins

## Tech Stack

- **Frontend**: Next.js 16+ (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth v4 (Credentials + JWT)
- **Charts**: Recharts
- **UI Components**: Shadcn/ui + Radix UI
- **Password Hashing**: bcryptjs

## Project Structure

```
talent-compass/
├── app/
│   ├── api/                    # API routes
│   │   ├── admin/             # Admin endpoints
│   │   ├── auth/              # Authentication
│   │   ├── courses/           # Course management
│   │   ├── learning-sessions/ # Learning tracker
│   │   ├── tests/             # Test submission
│   │   ├── feedback/          # Feedback system
│   │   └── roadmaps/          # Roadmap management
│   ├── (dashboard)/           # Protected routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── dashboard/         # Main dashboard
│   │   ├── courses/           # Course listing
│   │   ├── tracker/           # Learning tracker UI
│   │   ├── profile/           # User profile
│   │   └── roadmap/           # Roadmap viewer
│   └── auth/
│       ├── signin/            # Sign-in page
│       └── signup/            # Sign-up page
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── layout/                # Layout components
│   └── auth/                  # Auth components
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Utilities
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
├── middleware.ts             # Route protection middleware
└── config/
    └── nav.ts                # Navigation config
```

## Database Schema

### Core Entities

- **User**: id, name, email, role (candidate/learner/supervisor/admin), archetype, supervisorId
- **Course**: id, title, description, difficulty, contentType, roadmapId, duration, version
- **Roadmap**: id, name, archetype, modules[], courses[]
- **Module**: id, roadmapId, name, order
- **Archetype**: id, name, description
- **Test**: id, courseId, title, questions (JSON), type, timeLimit, passingScore, gradingType
- **TestResult**: id, userId, testId, score, answers (JSON), status, feedback
- **LearningSession**: id, userId, startTime, endTime, durationMinutes, status
- **Reflection**: id, userId, learningSessionId, text, mood, timestamp
- **Skill**: id, userId, name, level (0-5), proficiency (0-100), evidence
- **Feedback**: id, senderId, receiverId, courseId, type (comment/growth_note/kudos), text, rating
- **AuditLog**: id, userId, action, targetType, targetId, details, timestamp

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Environment Setup

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/archetype_os"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# App
NEXT_PUBLIC_APP_NAME="ArchetypeOS"
```

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Database Setup

```bash
# Create database (if using Supabase/Neon, skip this)
createdb archetype_os

# Run migrations
npx prisma migrate deploy

# Seed database with test data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` in your browser.

## Default Test Credentials

After seeding, use these accounts:

| Email | Password | Role | Archetype |
|-------|----------|------|-----------|
| admin@archetype.local | admin123 | Admin | Architect |
| supervisor@archetype.local | supervisor123 | Supervisor | Catalyst |
| learner1@archetype.local | learner123 | Learner | Maker |
| learner2@archetype.local | learner123 | Learner | Catalyst |
| candidate@archetype.local | candidate123 | Candidate | - |

## Key Features

### 1. Authentication & Authorization

- Credentials-based login with bcrypt password hashing
- JWT-based sessions with NextAuth
- Role-based access control (RBAC) via middleware
- Protected routes by role and archetype

### 2. Candidate Onboarding

- Sign up as candidate
- Auto-assigned onboarding course
- Automatic test after course completion
- Pass/Fail result with status notification
- Auto-promotion to Learner on passing

### 3. Course Management

- Admin can create courses with various content types (video, PDF, text, links)
- Courses grouped into Roadmaps by archetype
- Modules for organizing courses
- Difficulty levels (beginner, intermediate, advanced)
- Course versioning to maintain history
- Student progress tracking (0-100%)

### 4. Testing System

- Multiple question types: MCQ, written, coding
- Auto-grading for MCQs
- Manual grading interface for supervisors
- Configurable time limits and attempt limits
- Score weighting and passing thresholds
- Grader feedback and comments

### 5. Learning Session Tracker

- Clock-in/clock-out system
- 6-hour daily learning goal visualization
- Real-time progress tracking
- Automatic session duration calculation
- End-of-session reflection prompt

### 6. Daily Reflections

- Auto-prompted reflections after learning sessions
- Mood tracking (optional)
- Private journal entries
- Supervisor visibility (if configured)

### 7. Feedback & Mentorship

- Three feedback types: comments, growth notes, kudos
- Thread-based feedback on courses
- Peer recognition system
- Supervisor growth recommendations
- Weekly email digest (future phase)

### 8. Skill Intelligence

- Auto-built skill graphs from courses and tests
- 5-level proficiency scale (0-5)
- Percentage-based proficiency (0-100)
- Evidence tracking (linked courses)
- Skill search for internal staffing
- Archetype evolution tracking

### 9. Dashboards

**Learner Dashboard:**
- Personal progress %, learning hours, streaks
- Enrolled courses and progress
- Recent learning sessions
- Skills overview
- Upcoming courses/tests

**Supervisor Dashboard:**
- List of learners under supervision
- Team learning compliance (6h tracking)
- Individual progress and performance
- Idle learner alerts (no progress for X days)
- Grading queue for pending assessments

**Admin Dashboard:**
- Organization-wide analytics
- Total learning hours
- User distribution by role
- Top courses
- Average test scores
- Charts and visualizations

### 10. Role-Based Navigation

Routes automatically adjust based on user role using middleware.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (admin)
- `GET /api/courses/[courseId]` - Get course details
- `PUT /api/courses/[courseId]` - Update course (admin)
- `DELETE /api/courses/[courseId]` - Delete course (admin)
- `POST /api/courses/[courseId]/enroll` - Enroll in course

### Tests
- `GET /api/tests` - List tests
- `POST /api/tests` - Create test (admin)
- `POST /api/tests/[testId]/submit` - Submit test answers

### Learning Sessions
- `GET /api/learning-sessions` - Get user sessions
- `POST /api/learning-sessions` - Start session
- `PUT /api/learning-sessions/[sessionId]` - End session + reflection

### Feedback
- `GET /api/feedback` - Get feedback for user
- `POST /api/feedback` - Create feedback

### Reflections
- `GET /api/reflections` - Get user reflections
- `POST /api/reflections` - Create reflection

### Skills
- `GET /api/user/skills` - Get user skills
- `POST /api/user/skills` - Create/update skill

### Roadmaps
- `GET /api/roadmaps` - List roadmaps
- `POST /api/roadmaps` - Create roadmap (admin)

### Admin
- `GET /api/admin/users` - List all users (admin)
- `PUT /api/admin/users/[userId]/promote` - Promote user (admin)
- `GET /api/admin/analytics` - Organization analytics (admin)

## Build & Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

```bash
vercel --prod
```

### Environment Variables for Production

Set these in your deployment platform:
- `DATABASE_URL` - Production database URL
- `NEXTAUTH_URL` - Production domain
- `NEXTAUTH_SECRET` - Secure random key

## Best Practices

1. **Password Security**: Always use bcrypt (already configured)
2. **Session Management**: JWT tokens expire after configured duration
3. **RBAC**: Middleware checks role before allowing access
4. **Data Validation**: Use Zod for API input validation
5. **Error Handling**: Comprehensive error messages in APIs
6. **Audit Logging**: Consider implementing audit trail for sensitive actions
7. **Rate Limiting**: Add rate limiting for auth endpoints in production

## Future Enhancements (Phase 2)

- Email notifications for feedback, test results, course assignments
- Integrations: GitHub, Figma, Google Meet, Zoom, Slack
- Advanced analytics: learning velocity, skill heatmaps
- Peer review system for assignments
- Gamification: badges, leaderboards, achievements
- Mobile app (React Native)
- Video storage optimization (CDN)
- Real-time collaboration features
- AI-powered recommendations

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Solution: Ensure PostgreSQL is running and DATABASE_URL is correct.

### NextAuth Issues

```
Error: NEXTAUTH_URL not set
```

Solution: Add `NEXTAUTH_URL` to `.env.local` matching your domain.

### Prisma Client Error

```
Error: The "prisma" package is missing
```

Solution: Run `npx prisma generate` after updating schema.

## License

Proprietary - ArchetypeOS

## Support

For issues or questions, refer to the documentation or contact your system administrator.

---

**ArchetypeOS MVP** - Built for high-performance organizations with structured learning cultures.
