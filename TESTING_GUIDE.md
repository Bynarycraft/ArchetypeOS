# Quick Start & Testing Guide

## 🚀 Getting Started

### 1. Ensure Database is Seeded

```bash
# Run seeds to populate sample data
npm run seed
# or
npx prisma db seed
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 👤 Test Accounts (Pre-seeded)

### Admin Account
- **Email:** admin@archetype.local
- **Password:** admin123
- **Role:** Admin

### Learner Account
- **Email:** learner1@archetype.local
- **Password:** learner123
- **Role:** Learner

### Candidate Account
- **Email:** candidate@archetype.local
- **Password:** candidate123
- **Role:** Candidate

---

## 🧪 Testing Workflows

### ✅ Test 1: Admin Creates Course

1. Login with **admin@archetype.local** / **admin123**
2. Sidebar → **Course Management**
3. Click **New Course** button
4. Fill in form:
   - Title: "My Test Course"
   - Description: "Test description"
   - Difficulty: "Intermediate"
   - Content Type: "Video"
   - Content URL: "https://youtube.com/watch?v=VIDEO_ID"
   - Duration: 120
5. Click **Create Course**
6. Should redirect to course list and see new course

**Expected Result:** ✅ Course appears in list with correct details

---

### ✅ Test 2: Admin Edits Course

1. In Course Management page
2. Click **Edit** on any course
3. Change title to something different
4. Click **Update Course**
5. Should return to list and see updated title

**Expected Result:** ✅ Course updates in real-time

---

### ✅ Test 3: Admin Deletes Course

1. In Course Management page
2. Click **Trash** icon on any course
3. Confirm deletion in dialog
4. Course should disappear from list

**Expected Result:** ✅ Course removed and confirmation shows

---

### ✅ Test 4: User Enrolls in Course

1. Login with **learner1@archetype.local** / **learner123**
2. Sidebar → **Courses**
3. Click any course card (e.g., "React Fundamentals")
4. See course details page
5. Click **Enroll Now** button
6. Page updates to show:
   - Progress bar (0%)
   - Progress card on right
   - **View Content** button (if URL exists)

**Expected Result:** ✅ Enrollment created, progress shows, content button appears

---

### ✅ Test 5: Course Content Display

1. After enrolling in a course
2. Click **View Content** button
3. If video: YouTube player embeds and plays
4. If PDF: Link opens in new tab
5. If text: Shows resource info

**Expected Result:** ✅ Content displays based on type

---

### ✅ Test 6: Course Detail Page Elements

1. Navigate to any course detail page
2. Verify elements exist:
   - ✅ Course title and description
   - ✅ Difficulty badge (color-coded)
   - ✅ Duration, type, enrollment count
   - ✅ Completion status (if completed)
   - ✅ Enrollment card (sticky on desktop)
   - ✅ Assessments section (if tests exist)
   - ✅ Back to library link

**Expected Result:** ✅ All UI elements present and styled correctly

---

### ✅ Test 7: Sidebar Navigation

1. Logout and login with different roles
2. Verify sidebar changes:

**Candidate:**
- Dashboard
- Courses

**Learner:**
- Dashboard
- Roadmap
- Courses
- Learning Tracker

**Admin:**
- Dashboard
- User Management
- **Course Management** ← New
- Analytics

**Expected Result:** ✅ Admin sees "Course Management" link

---

### ✅ Test 8: Role-Based Access Control

1. Login as Candidate
2. Try to manually navigate to `/admin/courses`
3. Should redirect to `/dashboard` (access denied)

**Expected Result:** ✅ Non-admin users can't access admin pages

---

## 🎨 Responsive Design Testing

### Desktop View
- 3-column grid on course listing
- Sticky enrollment card on detail page
- Full sidebar navigation

### Tablet View (768px)
- 2-column grid on course listing
- Sticky card still visible
- Sidebar visible

### Mobile View (<640px)
- Single column grid
- Enrollment card stacked below content
- Responsive buttons and forms

**Test:** Resize browser window or use mobile device

---

## 📊 Sample Data Overview

### 6 Pre-seeded Courses:
1. **React Fundamentals** - Beginner, Video, 120 min
2. **Advanced React Patterns** - Advanced, Video, 180 min
3. **Node.js & Express** - Intermediate, Video, 150 min
4. **TypeScript** - Intermediate, Video, 140 min
5. **PostgreSQL** - Intermediate, PDF, 160 min
6. **System Design** - Advanced, Text, 240 min

### Pre-seeded Enrollments:
- Learner1: Enrolled in React (100%), Advanced React (45%), Node.js (30%)
- Learner2: Enrolled in React (60%), TypeScript (20%)
- Candidate1: Started React (15%)

---

## 🔍 Common Issues & Solutions

### Issue: "Unauthorized" when creating course
**Solution:** Make sure you're logged in as admin role user

### Issue: Courses not showing
**Solution:** Run `npm run seed` to populate database

### Issue: "Course not found" error
**Solution:** Verify course ID exists, check browser console for errors

### Issue: Form submission fails
**Solution:** Ensure all required fields are filled (title, difficulty, content type)

### Issue: Video not embedding
**Solution:** Use YouTube URLs in format: `https://youtube.com/watch?v=VIDEO_ID`

---

## 📱 API Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/courses` | List all courses | Required |
| POST | `/api/courses` | Create course | Admin only |
| GET | `/api/courses/[id]` | Get course details | Required |
| PUT | `/api/courses/[id]` | Update course | Admin only |
| DELETE | `/api/courses/[id]` | Delete course | Admin only |
| POST | `/api/courses/[id]/enroll` | Enroll user | Required |
| GET | `/api/courses/[id]/enroll-status` | Get enrollment status | Required |

---

## 🚦 Status Indicators

### Course Difficulty Colors:
- 🟢 **Beginner** - Green badge
- 🟡 **Intermediate** - Amber badge  
- 🔴 **Advanced** - Red badge

### Enrollment Status:
- 🟡 **in_progress** - Yellow badge
- ✅ **completed** - Green badge with checkmark
- ⏸️ **started** - Blue badge

### Content Types:
- 🎥 **Video** - Blue icon
- 📄 **PDF** - Red icon
- 📝 **Text** - Amber icon
- 🔗 **Link** - Purple icon

---

## 📝 Notes

- All forms validate required fields client-side
- Database shows enrollment count per course
- Progress tracking persists across sessions
- Back navigation always works
- No data loss on enrollment
- Admin operations require confirmation for delete

---

## ✅ Verification Checklist

Before considering the upgrade complete:

- [ ] Can create course as admin
- [ ] Can edit course as admin
- [ ] Can delete course as admin
- [ ] Can see all courses in library
- [ ] Can click course and see details
- [ ] Can enroll in course
- [ ] Can see progress bar after enrollment
- [ ] Can access course content
- [ ] Video embeds work
- [ ] Admin sidebar shows "Course Management"
- [ ] Non-admin can't access admin pages
- [ ] Back navigation works
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] All buttons clickable

---

**Happy Testing! 🎉**

For issues or questions, check the `UI_REFACTOR_SUMMARY.md` file for detailed documentation.
