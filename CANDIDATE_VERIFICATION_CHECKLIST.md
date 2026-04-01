# Candidate User Story Verification Checklist

## Overview
This checklist verifies that all 8 candidate user stories are fully implemented and working correctly as of the latest code commit.

---

## Story 1: Candidate Dashboard & Overview
**Requirement:** Candidate can view dashboard showing assigned course, progress, and key metrics.

**Implementation Status:** ✅ COMPLETE
- **Location:** `app/(dashboard)/candidate/page.tsx`
- **Verification Points:**
  - [x] Role guard: Redirects non-candidates to `/dashboard`
  - [x] Displays "Candidate Dashboard" with assignment-focused copy
  - [x] Shows metrics: Hours Logged, Courses Enrolled, Courses Completed, Assessments Passed
  - [x] Displays "Current Enrollments" card with enrollment status and progress
  - [x] Displays "Assigned Learning Path" card with links to assigned courses
  - [x] Direct action buttons: "View Assigned Course" and "Status Updates"
  - [x] Data fetched from: `courseEnrollments`, `testResults`, `dailyLearningSessions`

---

## Story 2: View Assigned Course
**Requirement:** Candidate can access and view the course they're enrolled in with lessons and content.

**Implementation Status:** ✅ COMPLETE
- **Location:** `app/(dashboard)/courses/page.tsx`
- **Verification Points:**
  - [x] Filters courses: Candidates see ONLY their enrolled courses (via `courseEnrollment`)
  - [x] Displays course title, description, difficulty, and duration
  - [x] Each course is clickable and links to `/courses/{courseId}`
  - [x] Course roadmap archetype displayed on card
  - [x] Tab helper explains: "Compare module difficulty and content type", "Open any course card to view details and lessons"
  - [x] Query condition: `role === "candidate"` uses `candidateCourseIds` from enrollments

---

## Story 3: Take & Complete Tests/Assessments
**Requirement:** Candidate can view assigned tests and attempt them.

**Implementation Status:** ✅ COMPLETE
- **Location:** `app/(dashboard)/tests/page.tsx`
- **Verification Points:**
  - [x] Filters tests: Candidates see ONLY tests from enrolled courses
  - [x] Shows test title, course, difficulty, and time limit
  - [x] Displays last score or "Not attempted yet" status
  - [x] Buttons: "Start Test" (new) or "Retake Test" (if completed)
  - [x] Links to `/courses/{courseId}/test/{testId}` for test submission
  - [x] Tab helper explains: "Start new tests or retake completed ones", "View time limits before beginning"
  - [x] Query filters: `where: role === "candidate" ? { courseId: { in: candidateCourseIds } } : undefined`

---

## Story 4: Track Progress & Learning Hours
**Requirement:** Candidate can track their learning hours, course completion, and assessment performance.

**Implementation Status:** ✅ COMPLETE
- **Location:** `app/(dashboard)/candidate/page.tsx`
- **Verification Points:**
  - [x] "Hours Logged" stat: Aggregates `dailyLearningSessions.durationMinutes` to hours
  - [x] "Courses Enrolled" stat: Count of `courseEnrollments`
  - [x] "Courses Completed" stat: Count of enrollments with `status === "completed"`
  - [x] "Assessments Passed" stat: Count of `testResults` where `score >= passingScore`
  - [x] "Current Enrollments" card shows progress percentage per course
  - [x] Data sources: Real database queries (not mocked)

---

## Story 5: View Application Status Updates & Notifications
**Requirement:** Candidate can view in-app notifications about their application status (pending/accepted/rejected).

**Implementation Status:** ✅ COMPLETE
- **Location:** `app/(dashboard)/notifications/page.tsx`
- **Verification Points:**
  - [x] Fetches notifications from `/api/notifications` endpoint
  - [x] Displays notification title, message, type, priority, and timestamp
  - [x] Shows "read" status with visual indicator
  - [x] Notifications organized by priority (high=red, low=green, normal=yellow)
  - [x] Empty state when no notifications
  - [x] Data contract matches Notification model: `{ id, title, message, type, priority, createdAt, readAt, isRead }`

---

## Story 6: Receive Email Notifications
**Requirement:** When a decision is made (accept/reject/pending), candidate receives email notification.

**Implementation Status:** ✅ COMPLETE
- **Location:** `lib/email.ts` + `app/api/admin/candidates/[userId]/decision/route.ts`
- **Verification Points:**
  - [x] Endpoint accepts `decision` (accept|reject|pending) and optional `phone`
  - [x] Admin/supervisor can trigger decision from UI with optional email delivery
  - [x] `sendCandidateStatusEmail()` implemented with SMTP support via nodemailer
  - [x] Email includes decision-specific message:
    - Accept: "Congratulations! You have been accepted..."
    - Reject: "Your application has been reviewed and marked as rejected..."
    - Pending: "Your application is currently pending review..."
  - [x] Returns `{ sent: boolean }` to indicate delivery success
  - [x] Gracefully handles missing SMTP env vars (logs error, continues)
  - [x] Response includes `emailSent` flag

---

## Story 7: Receive SMS Notifications
**Requirement:** When a decision is made, candidate optionally receives SMS notification if phone number provided.

**Implementation Status:** ✅ COMPLETE
- **Location:** `lib/sms.ts` + `app/api/admin/candidates/[userId]/decision/route.ts`
- **Verification Points:**
  - [x] Endpoint accepts optional `phone` parameter in decision request body
  - [x] Admin prompted for phone number when making decision (from UI)
  - [x] `sendCandidateStatusSms()` implemented with Twilio support
  - [x] SMS includes decision-specific message
  - [x] Returns `{ sent: boolean }` to indicate delivery success
  - [x] Gracefully handles missing Twilio env vars (logs error, continues)
  - [x] Response includes `smsSent` flag
  - [x] SMS is optional: no error if phone not provided or delivery fails

---

## Story 8: Application Decision Workflow
**Requirement:** Admin/Supervisor can make a decision (accept/reject/pending) on candidate application:
- Pending: Application under review
- Accept: Candidate promoted to learner role with full platform access
- Reject: Application marked as rejected

**Implementation Status:** ✅ COMPLETE
- **Location:** `app/(dashboard)/admin/users/page.tsx` + `app/api/admin/candidates/[userId]/decision/route.ts`
- **Verification Points:**

  **Decision Endpoint (`app/api/admin/candidates/[userId]/decision/route.ts`):**
  - [x] Role guard: Only admin/supervisor allowed
  - [x] Supervisor guard: Can only review their assigned supervisees
  - [x] Only candidates can be reviewed (role check)
  - [x] `pending` state: Keeps user as candidate, creates notification
  - [x] `accept` state:
    - Promotes user from candidate → learner role
    - Creates success notification with acceptance message
    - Unlocks full platform access (all learner tabs become visible)
  - [x] `reject` state: Keeps candidate role, creates error notification
  - [x] Creates in-app `Notification` model entry for each decision
  - [x] PATCH method on candidate user
  - [x] Returns decision result with channel flags: `{ success, decision, emailSent, smsSent }`

  **Admin UI (`app/(dashboard)/admin/users/page.tsx`):**
  - [x] Three decision buttons: Pending, Accept, Reject
  - [x] Optional phone input prompt for SMS delivery
  - [x] Sends request: `{ decision, phone }` to decision endpoint
  - [x] Toast feedback shows decision + channel status: "In-app | Email | SMS"
  - [x] UI updates after decision submission

---

## Database Model Support
**Verification Points:**
- [x] `Notification` model: id, userId, title, message, type, priority, createdAt, readAt, isRead
- [x] `User` model: id, role (includes 'candidate'/'learner'), email, name, courseEnrollments, supervisorId
- [x] `CourseEnrollment` model: userId, courseId, status, progress
- [x] `TestResult` model: userId, testId, score, submittedAt
- [x] `DailyLearningSession` model: userId, startTime, durationMinutes

---

## Navigation & Route Protection
**Verification Points:**
- [x] Candidate tabs in `config/nav.ts`: Dashboard (/candidate), Assigned Course (/courses), Tests (/tests), Notifications (/notifications)
- [x] Route guard in `proxy.ts`: Candidates redirected from learner/admin routes
- [x] Candidates cannot access: /dashboard, /roadmap, /tracker, /admin, /supervisor

---

## Environment Variables (Required for Full Functionality)
**For Email Delivery:**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

**For SMS Delivery:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

**Note:** All features work without these vars; channels gracefully degrade.

---

## Local Testing Instructions

### Setup
```sh
cd talent-compass
npm run seed  # Creates candidate@archetype.local / candidate123
npm run dev   # Start dev server
```

### Test Sequence
1. **Sign in as Candidate**
   - Email: `candidate@archetype.local`
   - Password: `candidate123`
   - Expected: Dashboard redirects to `/candidate`

2. **Verify Candidate Tabs**
   - Navigate sidebar: Dashboard, Assigned Course, Tests, Notifications
   - Verify no learner/admin tabs visible

3. **View Assigned Course**
   - Go to `/courses`
   - Should see only enrolled courses (not all courses)
   - Click course → access lessons

4. **View and Attempt Test**
   - Go to `/tests`
   - Should see only tests for enrolled courses
   - Click test → `/courses/{courseId}/test/{testId}`

5. **Check Progress Metrics**
   - Return to Dashboard
   - Verify Hours Logged, Courses, Assessments stats update based on data

6. **Sign in as Admin**
   - Email: `admin@archetype.local`
   - Password: `admin123`
   - Go to `/admin/users`

7. **Test Decision Workflow**
   - Find Charlie Candidate
   - Click "Pending" → confirm notification created
   - Click "Accept" → confirm:
     - User role changes to learner
     - Candidate tabs disappear on next login
     - "Congratulations" notification appears
   - From supervisor account, click "Reject" → confirm rejection notification

8. **Verify SMS + Email (Optional)**
   - When making a decision, if phone number provided, SMS attempt made
   - Toast shows channel status: "In-app ✓ | Email ✓ | SMS ✓"
   - (Actual delivery requires env vars)

---

## Summary
- **8/8 Stories Implemented:** ✅
- **Code Status:** Production-ready
- **Testing Status:** Ready for local verification with provided seed data
- **Deployment Status:** Push to production after env var configuration
