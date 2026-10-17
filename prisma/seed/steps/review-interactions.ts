import {
  ReportReason,
  ReportStatus,
  type PrismaClient,
  type Review,
  type User,
} from "../../../lib/generated/prisma/client";
import { randomDate, randomBetween, randomChoice } from "../utils";

/** Review votes, instructor replies and reports. */
export async function seedReviewInteractions(
  prisma: PrismaClient,
  { students, createdReviews, instructor }: { students: User[]; createdReviews: Review[]; instructor: User },
): Promise<void> {
  // 9. Add review interactions (votes, replies, reports)
  console.log("💬 Adding review interactions...");

  // Create review votes
  const votingStudents = students.slice(0, 6); // First 6 students vote on reviews

  for (const review of createdReviews.slice(0, 8)) {
    // Vote on first 8 reviews
    const numVotes = randomBetween(1, 4);
    const votersSubset = votingStudents.slice(0, numVotes);

    for (const voter of votersSubset) {
      // Don't vote on your own review
      if (voter.id !== review.userId) {
        await prisma.reviewVote.create({
          data: {
            userId: voter.id,
            reviewId: review.id,
            helpful: Math.random() < 0.8, // 80% helpful votes
            createdAt: randomDate(new Date(review.createdAt), new Date()),
          },
        });
      }
    }
  }

  // Create instructor replies to some reviews
  const repliedReviews = createdReviews.slice(0, 5); // Reply to first 5 reviews

  const instructorReplies = [
    "Merci beaucoup pour ce retour positif ! Je suis ravi que la formation vous ait apporté les compétences recherchées. N'hésitez pas si vous avez des questions.",
    "Merci pour votre avis constructif. Je prends note de vos suggestions pour améliorer le contenu. La prochaine mise à jour inclura plus d'exercices intermédiaires.",
    "Excellent ! Félicitations pour votre progression. C'est exactement l'objectif de cette formation : vous donner les outils pour évoluer dans votre carrière.",
    "Merci pour ce feedback détaillé. Je suis heureux que l'approche pratique vous ait convenu. Bonne continuation dans vos projets !",
    "Merci ! C'est formidable de voir que la formation a eu un impact concret sur votre carrière. Continuez comme ça !",
  ];

  for (let i = 0; i < repliedReviews.length; i++) {
    const review = repliedReviews[i];

    await prisma.reviewReply.create({
      data: {
        reviewId: review.id,
        userId: instructor.id, // Instructor replies
        content: instructorReplies[i],
        createdAt: randomDate(new Date(review.createdAt), new Date()),
      },
    });
  }

  // Create a few review reports (for moderation testing)
  const reportedReviews = createdReviews.slice(-2); // Report last 2 reviews

  for (const review of reportedReviews) {
    const reporter = randomChoice(
      students.filter((s) => s.id !== review.userId)
    );

    await prisma.reviewReport.create({
      data: {
        reviewId: review.id,
        userId: reporter.id,
        reason: randomChoice([
          ReportReason.SPAM,
          ReportReason.INAPPROPRIATE,
          ReportReason.FAKE,
        ]),
        details:
          "Ce commentaire semble suspect ou non pertinent pour la formation.",
        status: ReportStatus.PENDING,
      },
    });
  }

  console.log("✅ Added review interactions (votes, replies, reports)");
}
