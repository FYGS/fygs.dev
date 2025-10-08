-- CreateEnum
CREATE TYPE "public"."PaymentKind" AS ENUM ('COURSE', 'SUBSCRIPTION', 'REFUND');

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "kind" "public"."PaymentKind" NOT NULL DEFAULT 'COURSE';

-- CreateIndex
CREATE INDEX "Payment_userId_courseId_idx" ON "public"."Payment"("userId", "courseId");
