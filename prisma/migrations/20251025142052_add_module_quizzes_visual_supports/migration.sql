/*
  Warnings:

  - A unique constraint covering the columns `[moduleId,order]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Certificate" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "moduleId" TEXT,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Progress" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'INCOMPLETE';

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visual_support" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visual_support_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_question_result" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correct" INTEGER NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_question_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Module_courseId_order_idx" ON "Module"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseId_slug_key" ON "Module"("courseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseId_order_key" ON "Module"("courseId", "order");

-- CreateIndex
CREATE INDEX "visual_support_courseId_moduleId_idx" ON "visual_support"("courseId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "visual_support_courseId_moduleId_order_key" ON "visual_support"("courseId", "moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_question_result_quizId_order_key" ON "quiz_question_result"("quizId", "order");

-- CreateIndex
CREATE INDEX "QuizResult_userId_quizId_completedAt_idx" ON "QuizResult"("userId", "quizId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResult_userId_quizId_key" ON "QuizResult"("userId", "quizId");

-- CreateIndex
CREATE INDEX "Lesson_courseId_order_idx" ON "Lesson"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_order_key" ON "Lesson"("moduleId", "order");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_support" ADD CONSTRAINT "visual_support_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question_result" ADD CONSTRAINT "quiz_question_result_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
