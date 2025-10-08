/*
  Warnings:

  - The values [BASIC,PRO] on the enum `CourseAccessTier` will be removed. If these variants are still used in the database, this will fail.
  - The values [BASIC,PRO] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CourseAccessTier_new" AS ENUM ('FREE', 'PREMIUM');
ALTER TABLE "public"."Course" ALTER COLUMN "accessTier" DROP DEFAULT;
ALTER TABLE "public"."Course" ALTER COLUMN "accessTier" TYPE "public"."CourseAccessTier_new" USING ("accessTier"::text::"public"."CourseAccessTier_new");
ALTER TYPE "public"."CourseAccessTier" RENAME TO "CourseAccessTier_old";
ALTER TYPE "public"."CourseAccessTier_new" RENAME TO "CourseAccessTier";
DROP TYPE "public"."CourseAccessTier_old";
ALTER TABLE "public"."Course" ALTER COLUMN "accessTier" SET DEFAULT 'FREE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."SubscriptionPlan_new" AS ENUM ('FREE', 'PREMIUM');
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" TYPE "public"."SubscriptionPlan_new" USING ("plan"::text::"public"."SubscriptionPlan_new");
ALTER TYPE "public"."SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "public"."SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" SET DEFAULT 'FREE';
