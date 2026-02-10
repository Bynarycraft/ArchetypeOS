# ArchetypeOS - Quick Reference Card

## 🚀 Get Started (Copy & Paste)

```bash
cd talent-compass
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
# Open http://localhost:3000
```

## 👤 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@archetype.local | admin123 |
| Supervisor | supervisor@archetype.local | supervisor123 |
| Learner | learner1@archetype.local | learner123 |
| Candidate | candidate@archetype.local | candidate123 |

## 📁 Key Files

```
lib/auth.ts                    # NextAuth configuration
prisma/schema.prisma           # Database schema (13 models)
app/api/                       # 16+ API endpoints
app/(dashboard)/              # Protected pages
middleware.ts                 # Route protection
SETUP_GUIDE.md               # Detailed setup
README_ARCHETYPE.md          # Full documentation
```

## 🔗 Important URLs

- **Home**: `http://localhost:3000`
- **Login**: `http://localhost:3000/auth/signin`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Courses**: `http://localhost:3000/courses`
- **Tracker**: `http://localhost:3000/tracker`
- **Admin**: `http://localhost:3000/admin/dashboard`
- **Prisma Studio**: `npx prisma studio`

## 🗄️ Database Setup Options

### Local PostgreSQL
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/archetype_os"
```

### Supabase (Cloud - Recommended)
```env
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[database]?sslmode=require"
```

### Neon (Cloud)
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]"
```

## 🛠️ Common Commands

```bash
npm run dev              # Start development
npm run build            # Build for production
npm start                # Run production
npx prisma studio       # Open GUI database browser
npx prisma db seed      # Seed with test data
npx prisma migrate dev  # Create new migration
npx prisma migrate reset # Reset database (⚠️ deletes data!)
npm run lint             # Check code
npm run lint -- --fix   # Fix lint issues
```

## 📊 Features Overview

### Courses
- Create/update/delete courses
- Multiple content types
- Enrollment tracking
- Progress monitoring (0-100%)

### Tests
- MCQ, written, coding types
- Auto-grading
- Time limits
- Attempt limits

### Learning Tracker
- Clock-in/out system
- 6-hour daily goal
- Real-time progress bar
- Daily reflections

### Analytics
- Individual dashboards
- Team supervision
- Organization-wide stats
- Chart visualizations

### Users & Roles
- Candidates (apply, test)
- Learners (learn, track)
- Supervisors (manage)
- Admins (full control)

## 🔐 Authentication

- Credentials-based login
- JWT sessions (secure)
- Bcryptjs password hashing (ready)
- Role-based access control
- Automatic session management

## 📈 API Quick Reference

```
GET    /api/courses              - List courses
POST   /api/courses              - Create course (admin)
POST   /api/courses/[id]/enroll  - Enroll in course
GET    /api/tests                - List tests
POST   /api/tests/[id]/submit    - Submit test
POST   /api/learning-sessions    - Start session
PUT    /api/learning-sessions/[id] - End session
GET    /api/admin/users          - List users (admin)
GET    /api/admin/analytics      - Analytics (admin)
```

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `npm run dev -- -p 3001` |
| Database error | Check PostgreSQL running & DATABASE_URL |
| Prisma error | `npx prisma generate` |
| bcryptjs missing | `npm install bcryptjs` |
| NEXTAUTH_SECRET error | Add to `.env.local` |

## 📚 Documentation Files

1. **SETUP_GUIDE.md** - Step-by-step setup (3,000+ words)
2. **README_ARCHETYPE.md** - Full documentation (4,000+ words)
3. **IMPLEMENTATION_SUMMARY.md** - What was built
4. **This file** - Quick reference

## 🎯 What's Included

✅ Complete database schema (13 models)
✅ Authentication system with roles
✅ 16+ API endpoints
✅ Candidate → Learner onboarding
✅ Course management system
✅ Test & assessment system
✅ Learning session tracker
✅ Daily reflections
✅ Analytics dashboards
✅ Skill tracking
✅ Role-based navigation
✅ Comprehensive seed data
✅ Full documentation
✅ Production-ready setup

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```
Set env vars in Vercel dashboard.

### Other Platforms
- Railway, Fly.io, Heroku - Follow their docs
- AWS, GCP, Azure - Containerize or use buildpacks

## 📞 Need Help?

1. Check **SETUP_GUIDE.md** troubleshooting section
2. Review **README_ARCHETYPE.md** for full details
3. Look at seed data in `prisma/seed.ts` for examples
4. Check inline code comments
5. Review error messages in terminal

## 🎓 Learning Resources

- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://next-auth.js.org
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind: https://tailwindcss.com/docs

---

**ArchetypeOS MVP v1.0** - Ready to go! 🚀

Built for the peachBlossom test. Good luck! 💪
