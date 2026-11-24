-- Quizzes and visual supports pointed at the ORDER of a module (an integer), so reordering or
-- deleting modules silently re-attached or orphaned them. They now reference Module.id.
-- Rows whose old position matches no module of their course were already unreachable and are removed.

-- Quiz
ALTER TABLE "Quiz" ADD COLUMN "moduleRef" TEXT;
UPDATE "Quiz" q SET "moduleRef" = m."id"
  FROM "Module" m WHERE m."courseId" = q."courseId" AND m."order" = q."moduleId";
DELETE FROM "Quiz" WHERE "moduleRef" IS NULL;
ALTER TABLE "Quiz" DROP COLUMN "moduleId";
ALTER TABLE "Quiz" RENAME COLUMN "moduleRef" TO "moduleId";
ALTER TABLE "Quiz" ALTER COLUMN "moduleId" SET NOT NULL;
CREATE INDEX "Quiz_courseId_idx" ON "Quiz"("courseId");
CREATE INDEX "Quiz_moduleId_idx" ON "Quiz"("moduleId");
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- VisualSupport
ALTER TABLE "visual_support" ADD COLUMN "moduleRef" TEXT;
UPDATE "visual_support" v SET "moduleRef" = m."id"
  FROM "Module" m WHERE m."courseId" = v."courseId" AND m."order" = v."moduleId";
DELETE FROM "visual_support" WHERE "moduleRef" IS NULL;
ALTER TABLE "visual_support" DROP COLUMN "moduleId";
ALTER TABLE "visual_support" RENAME COLUMN "moduleRef" TO "moduleId";
ALTER TABLE "visual_support" ALTER COLUMN "moduleId" SET NOT NULL;
CREATE INDEX "visual_support_courseId_moduleId_idx" ON "visual_support"("courseId", "moduleId");
CREATE UNIQUE INDEX "visual_support_courseId_moduleId_order_key" ON "visual_support"("courseId", "moduleId", "order");
ALTER TABLE "visual_support" ADD CONSTRAINT "visual_support_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
