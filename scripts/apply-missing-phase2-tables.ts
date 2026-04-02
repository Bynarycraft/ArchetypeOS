import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const statements: string[] = [
    `
    CREATE TABLE IF NOT EXISTS "Lesson" (
      "id" TEXT NOT NULL,
      "courseId" TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "contentType" TEXT NOT NULL DEFAULT 'text',
      "contentUrl" TEXT,
      "duration" INTEGER,
      "isRequired" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
    );
    `,
    `CREATE INDEX IF NOT EXISTS "Lesson_courseId_idx" ON "Lesson"("courseId");`,
    `CREATE INDEX IF NOT EXISTS "Lesson_order_idx" ON "Lesson"("order");`,
    `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Lesson_courseId_fkey'
      ) THEN
        ALTER TABLE "Lesson"
        ADD CONSTRAINT "Lesson_courseId_fkey"
        FOREIGN KEY ("courseId") REFERENCES "Course"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END
    $$;
    `,

    `
    CREATE TABLE IF NOT EXISTS "ReflectionComment" (
      "id" TEXT NOT NULL,
      "reflectionId" TEXT NOT NULL,
      "senderId" TEXT NOT NULL,
      "text" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "ReflectionComment_pkey" PRIMARY KEY ("id")
    );
    `,
    `CREATE INDEX IF NOT EXISTS "ReflectionComment_reflectionId_idx" ON "ReflectionComment"("reflectionId");`,
    `CREATE INDEX IF NOT EXISTS "ReflectionComment_senderId_idx" ON "ReflectionComment"("senderId");`,
    `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ReflectionComment_reflectionId_fkey'
      ) THEN
        ALTER TABLE "ReflectionComment"
        ADD CONSTRAINT "ReflectionComment_reflectionId_fkey"
        FOREIGN KEY ("reflectionId") REFERENCES "Reflection"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END
    $$;
    `,
    `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ReflectionComment_senderId_fkey'
      ) THEN
        ALTER TABLE "ReflectionComment"
        ADD CONSTRAINT "ReflectionComment_senderId_fkey"
        FOREIGN KEY ("senderId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END
    $$;
    `,

    `
    CREATE TABLE IF NOT EXISTS "Notification" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'info',
      "priority" TEXT NOT NULL DEFAULT 'normal',
      "actionUrl" TEXT,
      "isRead" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "readAt" TIMESTAMP(3),
      CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
    );
    `,
    `CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");`,
    `CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");`,
    `CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");`,
    `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Notification_userId_fkey'
      ) THEN
        ALTER TABLE "Notification"
        ADD CONSTRAINT "Notification_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END
    $$;
    `,

    `
    CREATE TABLE IF NOT EXISTS "Certificate" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "courseId" TEXT NOT NULL,
      "certificateNumber" TEXT NOT NULL,
      "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expiresAt" TIMESTAMP(3),
      "verificationCode" TEXT NOT NULL,
      "isVerified" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
    );
    `,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_verificationCode_key" ON "Certificate"("verificationCode");`,
    `CREATE INDEX IF NOT EXISTS "Certificate_userId_idx" ON "Certificate"("userId");`,
    `CREATE INDEX IF NOT EXISTS "Certificate_courseId_idx" ON "Certificate"("courseId");`,
    `CREATE INDEX IF NOT EXISTS "Certificate_verificationCode_idx" ON "Certificate"("verificationCode");`,
    `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Certificate_userId_fkey'
      ) THEN
        ALTER TABLE "Certificate"
        ADD CONSTRAINT "Certificate_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END
    $$;
    `,
  ];

  for (const [index, statement] of statements.entries()) {
    await prisma.$executeRawUnsafe(statement);
    console.log(`Applied statement ${index + 1}/${statements.length}`);
  }

  console.log("Missing phase-2 tables backfilled successfully.");
}

main()
  .catch((error) => {
    console.error("Backfill script failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
