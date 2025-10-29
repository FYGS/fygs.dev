import { z } from "zod";
import { ReportReason } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Comprehensive validation schemas for the review system
 */

// Review creation validation
export const createReviewSchema = z.object({
  courseId: z.string().cuid("ID de formation invalide"),
  rating: z
    .number()
    .min(1, "La note doit être entre 1 et 5")
    .max(5, "La note doit être entre 1 et 5")
    .int("La note doit être un nombre entier"),
  comment: z
    .string()
    .min(10, "Le commentaire doit contenir au moins 10 caractères")
    .max(2000, "Le commentaire ne peut pas dépasser 2000 caractères")
    .optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 10, {
      message: "Le commentaire doit contenir au moins 10 caractères",
    }),
});

// Review update validation
export const updateReviewSchema = z.object({
  rating: z
    .number()
    .min(1, "La note doit être entre 1 et 5")
    .max(5, "La note doit être entre 1 et 5")
    .int("La note doit être un nombre entier")
    .optional(),
  comment: z
    .string()
    .min(10, "Le commentaire doit contenir au moins 10 caractères")
    .max(2000, "Le commentaire ne peut pas dépasser 2000 caractères")
    .optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 10, {
      message: "Le commentaire doit contenir au moins 10 caractères",
    }),
});

// Review reply validation
export const createReplySchema = z.object({
  reviewId: z.string().cuid("ID d'avis invalide"),
  content: z
    .string()
    .min(5, "La réponse doit contenir au moins 5 caractères")
    .max(1000, "La réponse ne peut pas dépasser 1000 caractères")
    .transform((val) => val.trim()),
});

// Review vote validation
export const createVoteSchema = z.object({
  reviewId: z.string().cuid("ID d'avis invalide"),
  helpful: z.boolean({
    required_error: "Le type de vote est requis",
    invalid_type_error: "Le type de vote doit être un booléen",
  }),
});

// Review report validation
export const createReportSchema = z.object({
  reviewId: z.string().cuid("ID d'avis invalide"),
  reason: z.nativeEnum(ReportReason, {
    required_error: "La raison du signalement est requise",
    invalid_type_error: "Raison de signalement invalide",
  }),
  details: z
    .string()
    .max(500, "Les détails ne peuvent pas dépasser 500 caractères")
    .optional()
    .transform((val) => val?.trim()),
});

// Content filtering validation
export const contentFilterSchema = z.object({
  text: z.string().min(1, "Le texte à analyser est requis"),
  strict: z.boolean().default(false),
});

// Moderation action validation
export const moderationActionSchema = z.object({
  reviewId: z.string().cuid("ID d'avis invalide"),
  action: z.enum(["approve", "reject", "flag", "delete"], {
    required_error: "L'action est requise",
    invalid_type_error: "Action invalide",
  }),
  reason: z
    .string()
    .min(5, "La raison doit contenir au moins 5 caractères")
    .max(500, "La raison ne peut pas dépasser 500 caractères")
    .optional()
    .transform((val) => val?.trim()),
  moderatorNote: z
    .string()
    .max(1000, "La note ne peut pas dépasser 1000 caractères")
    .optional()
    .transform((val) => val?.trim()),
});

// Bulk moderation validation
export const bulkModerationSchema = z.object({
  reviewIds: z
    .array(z.string().cuid("ID d'avis invalide"))
    .min(1, "Au moins un avis doit être sélectionné")
    .max(100, "Maximum 100 avis peuvent être traités en lot"),
  action: z.enum(["approve", "reject", "delete"], {
    required_error: "L'action est requise",
    invalid_type_error: "Action invalide",
  }),
  reason: z
    .string()
    .min(5, "La raison doit contenir au moins 5 caractères")
    .max(500, "La raison ne peut pas dépasser 500 caractères")
    .optional()
    .transform((val) => val?.trim()),
});

// Review filters validation
export const reviewFiltersSchema = z.object({
  rating: z
    .union([z.number().min(1).max(5), z.array(z.number().min(1).max(5))])
    .optional(),
  verified: z.boolean().optional(),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .refine((data) => data.start <= data.end, {
      message: "La date de début doit être antérieure à la date de fin",
    })
    .optional(),
  sortBy: z
    .enum(["newest", "oldest", "helpful", "rating_high", "rating_low"])
    .default("newest"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z
    .string()
    .max(100, "La recherche ne peut pas dépasser 100 caractères")
    .optional()
    .transform((val) => val?.trim()),
});

// Export filters validation
export const exportFiltersSchema = z.object({
  format: z.enum(["csv", "json", "xlsx"], {
    required_error: "Le format d'export est requis",
  }),
  filters: reviewFiltersSchema.optional(),
  fields: z.array(z.string()).min(1, "Au moins un champ doit être sélectionné"),
  includePersonalData: z.boolean().default(false),
});

// Anti-spam validation
export const antiSpamSchema = z.object({
  userId: z.string().cuid(),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Content validation utilities
 */
export class ReviewContentValidator {
  private static readonly FORBIDDEN_WORDS = [
    // Spam patterns
    "click here",
    "guaranteed",
    "free money",
    "amazing opportunity",
    // Inappropriate content
    "fuck",
    "shit",
    "damn",
    "hell",
    "bitch",
    "ass",
    // Contact info patterns (basic)
    "@gmail.com",
    "@yahoo.com",
    "@hotmail.com",
    "whatsapp",
    "telegram",
  ];

  private static readonly SUSPICIOUS_PATTERNS = [
    /(.)\1{4,}/g, // Repeated characters (aaaa)
    /[A-Z]{10,}/g, // Excessive caps
    /\d{10,}/g, // Long numbers (phone numbers)
    /https?:\/\/[^\s]+/g, // URLs
    /[^\w\s.,!?;:-]/g, // Special characters
  ];

  /**
   * Validate review content for spam and inappropriate content
   */
  static validateContent(content: string): {
    isValid: boolean;
    issues: string[];
    confidence: number;
  } {
    const issues: string[] = [];
    let confidence = 1.0;

    // Check forbidden words
    const lowerContent = content.toLowerCase();
    const forbiddenFound = this.FORBIDDEN_WORDS.filter((word) =>
      lowerContent.includes(word.toLowerCase())
    );

    if (forbiddenFound.length > 0) {
      issues.push(`Contenu inapproprié détecté: ${forbiddenFound.join(", ")}`);
      confidence -= 0.3 * forbiddenFound.length;
    }

    // Check suspicious patterns
    this.SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        switch (index) {
          case 0:
            issues.push("Caractères répétitifs détectés");
            confidence -= 0.2;
            break;
          case 1:
            issues.push("Usage excessif de majuscules");
            confidence -= 0.1;
            break;
          case 2:
            issues.push("Numéros de téléphone potentiels détectés");
            confidence -= 0.3;
            break;
          case 3:
            issues.push("URLs détectées");
            confidence -= 0.4;
            break;
          case 4:
            issues.push("Caractères spéciaux suspects");
            confidence -= 0.1;
            break;
        }
      }
    });

    // Check content length vs quality
    const words = content.trim().split(/\s+/);
    const avgWordLength =
      words.reduce((sum, word) => sum + word.length, 0) / words.length;

    if (avgWordLength < 3) {
      issues.push("Contenu de faible qualité (mots trop courts)");
      confidence -= 0.2;
    }

    // Check for repetitive content
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    const diversity = uniqueWords.size / words.length;

    if (diversity < 0.5 && words.length > 10) {
      issues.push("Contenu répétitif détecté");
      confidence -= 0.3;
    }

    return {
      isValid: confidence > 0.5,
      issues,
      confidence: Math.max(0, confidence),
    };
  }

  /**
   * Check for duplicate content
   */
  static async checkDuplicateContent(
    content: string,
    userId: string,
    excludeReviewId?: string
  ) {
    // Simple similarity check - in production, use more sophisticated algorithms
    const similarity = await this.calculateContentSimilarity(
      content,
      userId,
      excludeReviewId
    );

    return {
      isDuplicate: similarity > 0.8,
      similarity,
      threshold: 0.8,
    };
  }

  /**
   * Calculate content similarity (simplified implementation)
   */
  private static async calculateContentSimilarity(
    content: string,
    userId: string,
    excludeReviewId?: string
  ): Promise<number> {
    try {
      const userReviews = await db.review.findMany({
        where: {
          userId,
          id: excludeReviewId ? { not: excludeReviewId } : undefined,
          comment: { not: null },
        },
        select: { comment: true },
      });

      if (userReviews.length === 0) return 0;

      const contentWords = new Set(content.toLowerCase().split(/\s+/));

      let maxSimilarity = 0;

      for (const review of userReviews) {
        if (!review.comment) continue;

        const reviewWords = new Set(review.comment.toLowerCase().split(/\s+/));
        const intersection = new Set(
          [...contentWords].filter((x) => reviewWords.has(x))
        );
        const union = new Set([...contentWords, ...reviewWords]);

        const similarity = intersection.size / union.size;
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }

      return maxSimilarity;
    } catch (error) {
      console.error("Error calculating content similarity:", error);
      return 0;
    }
  }
}

// Type exports
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;
export type CreateVoteInput = z.infer<typeof createVoteSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ModerationActionInput = z.infer<typeof moderationActionSchema>;
export type BulkModerationInput = z.infer<typeof bulkModerationSchema>;
export type ReviewFiltersInput = z.infer<typeof reviewFiltersSchema>;
export type ExportFiltersInput = z.infer<typeof exportFiltersSchema>;
