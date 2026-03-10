-- Enable RLS on all Prisma tables (accessed via direct DB connection, but good security practice)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Archetype" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Roadmap" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Module" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CourseEnrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Test" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LearningSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reflection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Allow the postgres role (used by Prisma via direct connection) to bypass RLS
-- These tables are ONLY accessed via Prisma (server-side), never via Supabase client
CREATE POLICY "Allow all for postgres role" ON "User" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Account" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Session" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "VerificationToken" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Archetype" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Roadmap" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Module" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Course" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "CourseEnrollment" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Test" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "TestResult" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "LearningSession" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Reflection" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Skill" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "Feedback" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "AuditLog" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for postgres role" ON "_prisma_migrations" FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Also allow service_role to access these tables
CREATE POLICY "Allow all for service_role" ON "User" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Account" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Session" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "VerificationToken" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Archetype" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Roadmap" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Module" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Course" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "CourseEnrollment" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Test" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "TestResult" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "LearningSession" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Reflection" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Skill" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "Feedback" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "AuditLog" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON "_prisma_migrations" FOR ALL TO service_role USING (true) WITH CHECK (true);