# ArchetypeOS Project Phases

This document turns the requested feature list into an execution plan that matches the current web app and keeps future work explicit.

## Phase 1 - Core Platform

Status: live in the app.

What is included:
- Authentication and RBAC for candidate, learner, supervisor, and admin.
- Course and roadmap management.
- Test creation, submission, grading, and pending-review queues.
- Learning session tracking and reflections.
- Supervisor dashboard, admin dashboard, and audit logs.
- Certificates, notifications, and role-based navigation.

## Phase 2 - Operational Intelligence

Status: partially live, partially planned.

This is the phase that matches your requested overview. It extends the current app into a system that behaves like a real internal talent platform.

### A. Course and Roadmap Management

Live:
- Create, edit, and delete courses.
- Assign difficulty, content type, duration, roadmap, and module.
- Versioned courses are already modeled.

Planned or partial:
- Multiple attachments per course.
- Favorites for learners.
- Explicit auto-completion and manual-completion rules per course.
- Course assignment by archetype or department.
- Rich completion metadata such as estimated hours and duration estimates.

### B. Testing and Assessments

Live:
- Test builder.
- MCQ and manual grading flows.
- Time limits and attempt limits.
- Pending grading queue.
- Score and feedback capture.

Planned or partial:
- Coding project and file-upload submissions.
- Scoring weights by component.
- Integrity metadata such as IP/device logging.
- Central grade-formula configuration.

### C. Learning and Work Routine Tracker

Live:
- Learning sessions.
- Clock-in/clock-out style tracking.
- Daily reflections.
- 6-hour learning goal visualizations.

Planned or partial:
- Explicit work-hour tracking separate from learning hours.
- Break-aware session math.
- Weekly learning-to-work aggregation snapshots.

### D. Analytics and Insights

Live:
- Admin dashboard metrics.
- Supervisor progress and idle learner views.
- CSV report exports.

Planned or partial:
- Snapshot tables for daily analytics.
- Streak analytics.
- Archetype-level trend tables.
- BI integration with Metabase or Superset.

### E. Mentorship and Feedback

Live:
- Feedback routes.
- Reflection comments where supported by schema.
- Notifications for activity.

Planned or partial:
- Growth notes separated from regular comments.
- Peer kudos points.
- Encrypted private journal storage.
- Weekly mentor digest emails.

### F. Skill Intelligence Layer

Live:
- Skill records.
- Evidence-based skill tracking.
- Admin and supervisor visibility into learner performance.

Planned or partial:
- Skill graphs.
- Searchable compound skill queries.
- Readiness score formula.
- Archetype evolution stages.

### G. Notification and Communication System

Live:
- Notification inbox.
- Course/test/admin system notifications.

Planned or partial:
- Supervisor-to-learner chat.
- Broadcast messaging.
- Attachments on messages.
- Email/SMS digests.

### H. Admin Management Console

Live:
- User management.
- Roadmaps, archetypes, courses, tests, certificates, and audit views.

Planned or partial:
- Permissions UI.
- Suspend/archive flows.
- Rich system log explorer.

### I. Integrations Phase

Status: future phase.

Targets:
- GitHub and Figma proof-of-work integrations.
- Google Meet and Zoom session tracking.
- Notion and Slack reflection posting.
- Webhook-based verification endpoints.

## Phase 3 - External Integrations And Automation

Status: future.

This phase should be reserved for external systems, automation, and proofs of learning that depend on third-party APIs and webhooks.

Suggested deliverables:
- GitHub commit verification.
- Design artifact verification.
- Meeting attendance logging.
- Automated progress digests.
- Background jobs for analytics snapshots and notifications.

## Implementation Rule

If a feature is listed as live, it must already exist in the app, the API, and the database.
If it is partial, the UI may exist but the data model or workflow is not fully enforced yet.
If it is future, it should stay out of the product copy until the supporting routes and tables exist.

## Current App Fit

The web app already fits Phase 1 and most of the operational backbone for Phase 2.

The main missing pieces for a complete Phase 2 are:
- Additional database tables for richer lesson/comment/notification/certificate workflows on the live database.
- More robust analytics snapshots.
- Messaging and integration endpoints.
- Stronger grading metadata and content attachments.
