-- Course: objectives and first publication date
ALTER TABLE "Course" ADD COLUMN "objectives" TEXT[];
UPDATE "Course" SET "objectives" = ARRAY[]::TEXT[];
ALTER TABLE "Course" ADD COLUMN "publishedAt" TIMESTAMP(3);
UPDATE "Course" SET "publishedAt" = "updatedAt" WHERE "published" = true;

-- Lesson: free preview flag; progress: resume position
ALTER TABLE "Lesson" ADD COLUMN "isPreview" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Progress" ADD COLUMN "lastPosition" INTEGER NOT NULL DEFAULT 0;

-- Certificate: public verification code (existing rows get one)
ALTER TABLE "Certificate" ADD COLUMN "code" TEXT;
UPDATE "Certificate" SET "code" = md5((random())::text || (clock_timestamp())::text || "id");
ALTER TABLE "Certificate" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "Certificate" ALTER COLUMN "code" SET DEFAULT md5(((random())::text || (clock_timestamp())::text));
CREATE UNIQUE INDEX "Certificate_code_key" ON "Certificate"("code");

-- Discussion: question asked from a lesson
ALTER TABLE "Discussion" ADD COLUMN "lessonId" TEXT;
CREATE INDEX "Discussion_lessonId_idx" ON "Discussion"("lessonId");
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Lesson resources
CREATE TYPE "LessonResourceKind" AS ENUM ('FILE', 'LINK');
CREATE TABLE "LessonResource" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" "LessonResourceKind" NOT NULL DEFAULT 'LINK',
    "sizeBytes" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LessonResource_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LessonResource_lessonId_order_idx" ON "LessonResource"("lessonId", "order");
ALTER TABLE "LessonResource" ADD CONSTRAINT "LessonResource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Learning paths
CREATE TABLE "Path" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT,
    "level" "CourseLevel" NOT NULL DEFAULT 'BEGINNER',
    "objectives" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Path_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Path_slug_key" ON "Path"("slug");
CREATE INDEX "Path_published_featured_idx" ON "Path"("published", "featured");
ALTER TABLE "Path" ADD CONSTRAINT "Path_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "PathCourse" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PathCourse_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PathCourse_pathId_courseId_key" ON "PathCourse"("pathId", "courseId");
CREATE UNIQUE INDEX "PathCourse_pathId_order_key" ON "PathCourse"("pathId", "order");
CREATE INDEX "PathCourse_courseId_idx" ON "PathCourse"("courseId");
ALTER TABLE "PathCourse" ADD CONSTRAINT "PathCourse_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "Path"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PathCourse" ADD CONSTRAINT "PathCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PathEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PathEnrollment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PathEnrollment_userId_pathId_key" ON "PathEnrollment"("userId", "pathId");
ALTER TABLE "PathEnrollment" ADD CONSTRAINT "PathEnrollment_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "Path"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PathEnrollment" ADD CONSTRAINT "PathEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PathCertificate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT md5(((random())::text || (clock_timestamp())::text)),
    "userId" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PathCertificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PathCertificate_code_key" ON "PathCertificate"("code");
CREATE UNIQUE INDEX "PathCertificate_userId_pathId_key" ON "PathCertificate"("userId", "pathId");
ALTER TABLE "PathCertificate" ADD CONSTRAINT "PathCertificate_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "Path"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PathCertificate" ADD CONSTRAINT "PathCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
