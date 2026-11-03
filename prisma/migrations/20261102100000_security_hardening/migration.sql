-- Security hardening (audit 2026-11). Constraints that make the business rules true under concurrency, and the
-- tables the fixes need: exam sittings, durable Stripe event claims, an audit trail, two-factor, uploaded media.
--
-- The unique indexes below FAIL if duplicates already exist. That is intended: find them with
--   SELECT "stripePaymentIntentId", count(*) FROM "Payment" WHERE "stripePaymentIntentId" IS NOT NULL GROUP BY 1 HAVING count(*) > 1;
--   SELECT token, count(*) FROM session GROUP BY 1 HAVING count(*) > 1;
-- and resolve them before deploying.

-- Payment: one row per Stripe payment intent; a chargeback closes access
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'DISPUTED';
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- Subscription: last Stripe event applied (ordering)
ALTER TABLE "Subscription" ADD COLUMN "lastEventAt" TIMESTAMP(3);

-- Session tokens are unique
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- XP: one award per reason and target
ALTER TABLE "XpEvent" ADD COLUMN "refId" TEXT;
CREATE UNIQUE INDEX "XpEvent_userId_reason_refId_key" ON "XpEvent"("userId", "reason", "refId");

-- Certificate: name printed at issue time
ALTER TABLE "Certificate" ADD COLUMN "holderName" TEXT;

-- User: second factor
ALTER TABLE "user" ADD COLUMN "twoFactorEnabled" BOOLEAN DEFAULT false;

CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT true,
    "failedVerificationCount" INTEGER DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "twoFactor_secret_idx" ON "twoFactor"("secret");
CREATE INDEX "twoFactor_userId_idx" ON "twoFactor"("userId");
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Final exam sittings
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "passed" BOOLEAN,
    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ExamAttempt_userId_examId_startedAt_idx" ON "ExamAttempt"("userId", "examId", "startedAt");
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "FinalExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Stripe events claimed with a lease
CREATE TYPE "ProcessedEventStatus" AS ENUM ('PROCESSING', 'DONE');
CREATE TABLE "ProcessedStripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "ProcessedEventStatus" NOT NULL DEFAULT 'PROCESSING',
    "leaseUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProcessedStripeEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProcessedStripeEvent_createdAt_idx" ON "ProcessedStripeEvent"("createdAt");

-- Audit trail
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Uploaded media
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO', 'FILE', 'CAPTIONS');
CREATE TABLE "MediaObject" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "MediaObject_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MediaObject_key_key" ON "MediaObject"("key");
CREATE INDEX "MediaObject_userId_createdAt_idx" ON "MediaObject"("userId", "createdAt");
ALTER TABLE "MediaObject" ADD CONSTRAINT "MediaObject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Verification codes of certificates come from a cryptographic generator (random() is not one). Existing codes stay valid.
ALTER TABLE "Certificate" ALTER COLUMN "code" SET DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text);
ALTER TABLE "PathCertificate" ALTER COLUMN "code" SET DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text);

-- better-auth stores the id of the user as the value of its second-factor challenge: two sign-ins of the same staff
-- member within the challenge's lifetime (two tabs, two devices) collided on a unique `value` and answered 500.
-- The unique pair (identifier, value) stays; `value` alone is not a key.
DROP INDEX IF EXISTS "verification_value_key";
