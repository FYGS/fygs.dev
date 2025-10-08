/*
  Warnings:

  - You are about to drop the column `context` on the `AnalyticsEvent` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentId` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."AnalyticsEvent_userId_type_createdAt_idx";

-- DropIndex
DROP INDEX "public"."InvoiceAudit_stripeInvoiceId_key";

-- DropIndex
DROP INDEX "public"."InvoiceAudit_userId_idx";

-- DropIndex
DROP INDEX "public"."Payment_userId_courseId_idx";

-- AlterTable
ALTER TABLE "public"."AnalyticsEvent" DROP COLUMN "context",
ADD COLUMN     "properties" JSONB;

-- AlterTable
ALTER TABLE "public"."Certificate" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."InvoiceAudit" ADD COLUMN     "currency" TEXT DEFAULT 'eur',
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "subscriptionId" TEXT,
ALTER COLUMN "stripeInvoiceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "stripePaymentId",
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "public"."AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_type_idx" ON "public"."AnalyticsEvent"("userId", "type");

-- CreateIndex
CREATE INDEX "InvoiceAudit_userId_type_idx" ON "public"."InvoiceAudit"("userId", "type");

-- CreateIndex
CREATE INDEX "InvoiceAudit_createdAt_idx" ON "public"."InvoiceAudit"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_userId_kind_status_idx" ON "public"."Payment"("userId", "kind", "status");

-- CreateIndex
CREATE INDEX "Payment_courseId_idx" ON "public"."Payment"("courseId");

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
