# Production Deployment Checklist

## Pre-Deployment Verification ✅ COMPLETE
- [x] All 8 candidate user stories implemented
- [x] Code compile checks passed
- [x] Local database seeded with test data
- [x] No TypeScript errors in candidate pages/APIs
- [x] Route protection and role guards in place
- [x] Prisma schema includes all required models

---

## Environment Variables to Configure

### SMTP Configuration (Email Notifications)
**Required for:** Candidate status emails (accept/reject/pending)

```
SMTP_HOST=<your-smtp-server>
SMTP_PORT=<smtp-port>  # Usually 587 (TLS) or 465 (SSL)
SMTP_USER=<sender-email>
SMTP_PASS=<sender-password>
SMTP_FROM=<sender-email-address>
```

**Example (Gmail/GSuite):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourcompany.com
SMTP_PASS=<app-password>
SMTP_FROM=noreply@yourcompany.com
```

**Testing:** Send test email to candidate@archetype.local after making a decision.

---

### Twilio Configuration (SMS Notifications)
**Required for:** Optional SMS candidate status notifications

```
TWILIO_ACCOUNT_SID=<your-account-sid>
TWILIO_AUTH_TOKEN=<your-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>
```

**Get from:** https://console.twilio.com

**Testing:** Provide phone number when making candidate decision, verify SMS received.

---

### NextAuth Configuration
**Already configured (do NOT change):**
```
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=<your-jwt-secret>
```

---

## Database Verification

### Required Migrations
All migrations already applied locally. On production, run:
```sh
npx prisma migrate deploy
```

### Models Present
- User (with role field: candidate, learner, supervisor, admin)
- CourseEnrollment
- Test & TestResult
- DailyLearningSession
- Notification
- Course & Module & Roadmap
- Archetype

---

## Code Deployment

### Git Status
All candidate changes committed to `main`:
- Latest commit: Candidate flow + SMS/Email notification integration + admin UI wiring

### Deployment Steps
```sh
# 1. Verify no uncommitted changes
git status

# 2. Pull latest main
git pull origin main

# 3. Install dependencies
npm ci

# 4. Build application
npm run build

# 5. Generate Prisma client
npx prisma generate

# 6. Deploy to your platform:
#    - Vercel: Connect GitHub, auto-deploys on push
#    - Other platforms: Use appropriate deploy command
```

---

## Configuration on Production Platform

### Vercel (Recommended)
1. Go to Project Settings → Environment Variables
2. Add all variables from "Environment Variables to Configure" section
3. Redeploy project

### Self-Hosted / Other Platforms
1. Set environment variables using your platform's mechanism
2. Ensure .env.local (or equivalent) includes all required vars
3. Restart application server

---

## Post-Deployment Testing

### 1. Smoke Test: Sign In
- Navigate to production URL
- Sign in as `candidate@archetype.local` / `candidate123`
- Expected: Redirects to `/candidate` dashboard

### 2. Smoke Test: Candidate Tabs
- Verify sidebar shows: Dashboard, Assigned Course, Tests, Notifications
- Verify no learner/admin tabs visible

### 3. Smoke Test: Assigned Course
- Click "Assigned Course" tab
- Expected: See only assigned courses (not all courses)

### 4. Smoke Test: Tests
- Click "Tests" tab
- Expected: See only tests for assigned courses
- Try starting a test (goes to test submission page)

### 5. Integration Test: Email Notification
- Sign in as `admin@archetype.local` / `admin123`
- Navigate to `/admin/users`
- Find Charlie Candidate
- Click "Accept" button
- Expected:
  - Toast shows: "In-app ✓ | Email ✓" (or "✗" if env vars missing)
  - Candidate receives email or admin notification in inbox

### 6. Integration Test: SMS Notification
- In admin users, click "Pending" for a candidate
- When prompted, enter phone number (e.g., +1-555-555-5555)
- Expected:
  - Toast shows: "In-app ✓ | Email ✓ | SMS ✓"
  - If Twilio configured: Candidate receives SMS

### 7. Integration Test: Decision Workflow
- Make decision as "Pending" → notification created
- Make decision as "Accept" → user role changes to learner
  - Sign out and sign in again
  - Expected: Candidate tabs gone, learner tabs visible
- Make decision as "Reject" → rejection notification created

---

## Rollback Instructions

If issues arise:
```sh
# Revert to previous stable commit
git revert <commit-hash>
git push origin main

# Or deploy previous version from your platform's dashboard
```

---

## Support & Debugging

### Email Not Sending?
- Check SMTP env vars are set correctly
- Check firewall allows SMTP port (587/465)
- Check "SMTP_FROM" matches authenticated user
- Check logs for email module errors

### SMS Not Sending?
- Check Twilio env vars are set correctly
- Check Twilio account has credits/active status
- Check phone number format (should include country code)
- Check logs for SMS module errors

### Candidate Can't Log In?
- Verify candidate user exists in production database
- Check NextAuth configuration
- Check NEXTAUTH_URL matches production domain
- Check NEXTAUTH_SECRET is set

### Route Not Accessible?
- Verify role-based access control in `proxy.ts`
- Check session/token is valid
- Check user.role is set to 'candidate' in database

---

## Production Runbook

### Daily Checks
- [ ] Candidate sign-in working
- [ ] Notifications appearing in-app
- [ ] Admin can make decisions
- [ ] No errors in application logs

### Weekly Checks
- [ ] SMTP delivery rate > 95% (check email logs)
- [ ] SMS delivery rate (if enabled) > 95%
- [ ] Candidate flow: Dashboard → Course → Test → Decision working

### Monthly Checks
- [ ] Database backup status
- [ ] Permission audits (supervisors can only review assigned candidates)
- [ ] Candidate progression tracking (pending → accept/reject ratios)

---

## Success Criteria
✅ Deployment successful when:
1. Candidate can sign in and see dashboard
2. Assigned course visible and accessible
3. Tests visible and startable
4. Admin can make decisions (accept/reject/pending)
5. At least in-app notifications appear (email/SMS optional)
6. No production errors in logs related to candidate flow

---

## Issues & Escalation
If you encounter issues:
1. Check logs for specific error messages
2. Verify all environment variables are set
3. Run local test to isolate production vs local issues
4. Consult CANDIDATE_VERIFICATION_CHECKLIST.md for detailed story mapping
