-- CreateTable
CREATE TABLE "FinalExam" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "timeLimit" INTEGER,
    "questions" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinalExam_courseId_published_idx" ON "FinalExam"("courseId", "published");

-- CreateIndex
CREATE UNIQUE INDEX "FinalExam_courseId_key" ON "FinalExam"("courseId");

-- CreateIndex
CREATE INDEX "ExamResult_userId_examId_passed_completedAt_idx" ON "ExamResult"("userId", "examId", "passed", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExamResult_userId_examId_key" ON "ExamResult"("userId", "examId");

-- AddForeignKey
ALTER TABLE "FinalExam" ADD CONSTRAINT "FinalExam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "FinalExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
