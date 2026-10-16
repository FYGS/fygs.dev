#!/usr/bin/env node

/**
 * FYGS Academy - Comprehensive Database Seed
 *
 * This script creates realistic, production-ready seed data for testing and development.
 * Includes all models with authentic content, proper relationships, and varied scenarios.
 *
 * Features:
 * - Real-world user profiles with Unsplash avatars
 * - Complete course catalog with detailed content
 * - Comprehensive review system with interactions
 * - Payment and subscription scenarios
 * - Rich progress tracking data
 * - Visual supports and quiz content
 * - Analytics-ready data patterns
 */

import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seed/steps/users";
import { seedSubscriptions } from "./seed/steps/subscriptions";
import { seedTags } from "./seed/steps/tags";
import { seedCourses } from "./seed/steps/courses";
import { seedCourseTags } from "./seed/steps/course-tags";
import { seedCurriculum } from "./seed/steps/curriculum";
import { seedEnrollments } from "./seed/steps/enrollments";
import { seedCommunityTopics } from "./seed/steps/community-topics";
import { seedCommunityBadges } from "./seed/steps/community-badges";
import { seedCommunityDiscussions } from "./seed/steps/community-discussions";
import { seedCommunityReplies } from "./seed/steps/community-replies";
import { seedCommunityEngagement } from "./seed/steps/community-engagement";
import { seedCommunitySocial } from "./seed/steps/community-social";
import { seedReviews } from "./seed/steps/reviews";
import { seedReviewInteractions } from "./seed/steps/review-interactions";
import { seedProgress } from "./seed/steps/progress";
import { seedPayments } from "./seed/steps/payments";
import { seedVisualSupports } from "./seed/steps/visual-supports";
import { seedFinalExams } from "./seed/steps/final-exams";
import { seedExamResults } from "./seed/steps/exam-results";
import { seedCertificates } from "./seed/steps/certificates";
import { seedAnalytics } from "./seed/steps/analytics";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive FYGS Academy database seed...");

  const startTime = Date.now();

  try {
    const { students, instructor, users } = await seedUsers(prisma);
    await seedSubscriptions(prisma, { students });
    const { tags } = await seedTags(prisma);
    const { courses } = await seedCourses(prisma, { instructor });
    await seedCourseTags(prisma, { courses, tags });
    await seedCurriculum(prisma, { courses });
    await seedEnrollments(prisma, { courses, students });
    const { topics } = await seedCommunityTopics(prisma, { courses });
    const { badges } = await seedCommunityBadges(prisma);
    const { discussions } = await seedCommunityDiscussions(prisma, { users, topics, courses });
    const { replies } = await seedCommunityReplies(prisma, { users, discussions });
    await seedCommunityEngagement(prisma, { students, discussions, replies, topics, instructor, badges });
    await seedCommunitySocial(prisma, { students, users, discussions, badges, instructor, courses });
    const { createdReviews, enrollments } = await seedReviews(prisma);
    await seedReviewInteractions(prisma, { students, createdReviews, instructor });
    await seedProgress(prisma, { enrollments });
    const { premiumEnrollments } = await seedPayments(prisma, { enrollments, courses });
    await seedVisualSupports(prisma, { courses });
    const { finalExams } = await seedFinalExams(prisma, { courses });
    const { examResults } = await seedExamResults(prisma, { finalExams, enrollments });
    const { completedEnrollments } = await seedCertificates(prisma, { enrollments });
    await seedAnalytics(prisma, { users, courses });

    // 17. Final statistics
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\n🎉 FYGS Academy seed completed successfully!");
    console.log("═".repeat(50));
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`⭐ Reviews: ${createdReviews.length}`);
    console.log(`🎓 Enrollments: ${enrollments.length}`);
    console.log(`💰 Payments: ${premiumEnrollments.length}`);
    console.log(`📝 Final exams: ${finalExams.length}`);
    console.log(`📊 Exam results: ${examResults.length}`);
    console.log(`🏆 Certificates: ${completedEnrollments.length}`);
    console.log(`🏷️  Tags: ${tags.length}`);
    console.log(`🏛️  Topics: ${topics.length}`);
    console.log(`💬 Discussions: ${discussions.length}`);
    console.log(`↩️  Replies: ${replies.length}`);
    console.log(`🎖️  Badges: ${badges.length}`);
    console.log(`📊 Analytics events: 500`);
    console.log("═".repeat(50));
    console.log(
      "🚀 Ready for development and testing with full community system!"
    );
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("💥 Fatal error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
