-- Lesson: captions file and transcript of the video
ALTER TABLE "Lesson" ADD COLUMN "captionsUrl" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "transcript" TEXT;

-- Enrollment: access granted by an administrator
ALTER TABLE "Enrollment" ADD COLUMN "grantedById" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "grantedAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Former course addresses
CREATE TABLE "CourseSlugRedirect" (
    "slug" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseSlugRedirect_pkey" PRIMARY KEY ("slug")
);
CREATE INDEX "CourseSlugRedirect_courseId_idx" ON "CourseSlugRedirect"("courseId");
ALTER TABLE "CourseSlugRedirect" ADD CONSTRAINT "CourseSlugRedirect_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
