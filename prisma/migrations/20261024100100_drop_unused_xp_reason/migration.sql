-- XpReason.DAILY_LOGIN was never awarded by the application. PostgreSQL cannot drop an enum value: the type is
-- recreated without it (rows holding it, if any were written by hand, are removed first).
DELETE FROM "XpEvent" WHERE "reason" = 'DAILY_LOGIN';
ALTER TYPE "XpReason" RENAME TO "XpReason_old";
CREATE TYPE "XpReason" AS ENUM ('LESSON_COMPLETED', 'QUIZ_PASSED', 'COURSE_COMPLETED', 'STREAK_BONUS', 'FIRST_LESSON');
ALTER TABLE "XpEvent" ALTER COLUMN "reason" TYPE "XpReason" USING ("reason"::text::"XpReason");
DROP TYPE "XpReason_old";
