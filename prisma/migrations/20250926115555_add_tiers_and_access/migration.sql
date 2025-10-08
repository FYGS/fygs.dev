-- CreateEnum
CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('BASIC', 'PREMIUM', 'PRO');

-- CreateEnum
CREATE TYPE "public"."CourseAccessTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'PRO');

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "accessTier" "public"."CourseAccessTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "previewEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "plan" "public"."SubscriptionPlan" NOT NULL DEFAULT 'BASIC';
