// Schema.org structured data types for reviews
export interface ReviewSchemaData {
  "@context": "https://schema.org";
  "@type": "Review";
  reviewRating: {
    "@type": "Rating";
    ratingValue: number;
    bestRating: number;
    worstRating: number;
  };
  author: {
    "@type": "Person";
    name: string;
    image?: string;
  };
  reviewBody?: string;
  datePublished: string;
  dateModified?: string;
  itemReviewed: {
    "@type": "Course" | "EducationalOccupationalProgram";
    name: string;
    description?: string;
    provider?: {
      "@type": "Organization";
      name: string;
      url?: string;
    };
    url?: string;
  };
  publisher?: {
    "@type": "Organization";
    name: string;
    url?: string;
  };
  inLanguage: "fr-FR";
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
}

export interface CourseAggregateRatingSchema {
  "@context": "https://schema.org";
  "@type": "Course" | "EducationalOccupationalProgram";
  name: string;
  description?: string;
  provider: {
    "@type": "Organization";
    name: string;
    url?: string;
  };
  aggregateRating: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  review?: ReviewSchemaData[];
  url?: string;
  inLanguage: "fr-FR";
  educationalLevel?: string;
  teaches?: string[];
  timeRequired?: string;
  courseMode?: "online" | "onsite" | "blended";
  coursePrerequisites?: string;
  hasCourseInstance?: {
    "@type": "CourseInstance";
    courseMode: "online" | "onsite" | "blended";
    instructor?: {
      "@type": "Person";
      name: string;
      jobTitle?: string;
    };
  };
}

export class ReviewSEOService {
  /**
   * Generate structured data for a single review
   */
  static generateReviewSchema(
    review: any,
    course: { title: string; description?: string; slug?: string },
    provider: { name: string; url?: string } = { name: "FYGS Academy" }
  ): ReviewSchemaData {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fygs.dev";

    return {
      "@context": "https://schema.org",
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        "@type": "Person",
        name: review.user?.name || "Utilisateur anonyme",
        ...(review.user?.image && { image: review.user.image }),
      },
      ...(review.comment && { reviewBody: review.comment }),
      datePublished: new Date(review.createdAt).toISOString(),
      ...(review.updatedAt !== review.createdAt && {
        dateModified: new Date(review.updatedAt).toISOString(),
      }),
      itemReviewed: {
        "@type": "Course",
        name: course.title,
        ...(course.description && { description: course.description }),
        provider: {
          "@type": "Organization",
          name: provider.name,
          ...(provider.url && { url: provider.url }),
        },
        ...(course.slug && { url: `${baseUrl}/courses/${course.slug}` }),
      },
      publisher: {
        "@type": "Organization",
        name: provider.name,
        ...(provider.url && { url: provider.url }),
      },
      inLanguage: "fr-FR",
    };
  }

  /**
   * Generate structured data for course aggregate rating
   */
  static generateCourseAggregateRatingSchema(
    course: any,
    analytics: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<number, number>;
    },
    reviews?: any[],
    instructor?: { name: string; jobTitle?: string },
    provider: { name: string; url?: string } = { name: "FYGS Academy" }
  ): CourseAggregateRatingSchema {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fygs.dev";

    const schema: CourseAggregateRatingSchema = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      ...(course.description && { description: course.description }),
      provider: {
        "@type": "Organization",
        name: provider.name,
        ...(provider.url && { url: provider.url }),
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Math.round(analytics.averageRating * 10) / 10,
        reviewCount: analytics.totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
      ...(course.slug && { url: `${baseUrl}/courses/${course.slug}` }),
      inLanguage: "fr-FR",
      ...(course.level && { educationalLevel: course.level }),
      ...(course.skills &&
        course.skills.length > 0 && { teaches: course.skills }),
      ...(course.duration && { timeRequired: course.duration }),
      courseMode: "online",
      ...(course.prerequisites && {
        coursePrerequisites: course.prerequisites,
      }),
    };

    // Add course instance with instructor if available
    if (instructor) {
      schema.hasCourseInstance = {
        "@type": "CourseInstance",
        courseMode: "online",
        instructor: {
          "@type": "Person",
          name: instructor.name,
          ...(instructor.jobTitle && { jobTitle: instructor.jobTitle }),
        },
      };
    }

    // Add individual reviews (limited to top 10 for performance)
    if (reviews && reviews.length > 0) {
      schema.review = reviews
        .slice(0, 10)
        .map((review) => this.generateReviewSchema(review, course, provider));
    }

    return schema;
  }

  /**
   * Generate breadcrumb structured data
   */
  static generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fygs.dev";

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
      })),
    };
  }

  /**
   * Generate FAQ structured data for common review questions
   */
  static generateReviewFAQSchema(
    course: { title: string },
    analytics: { averageRating: number; totalReviews: number }
  ) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Quelle est la note moyenne de ${course.title} ?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${
              course.title
            } a une note moyenne de ${analytics.averageRating.toFixed(
              1
            )}/5 basée sur ${analytics.totalReviews} avis vérifiés.`,
          },
        },
        {
          "@type": "Question",
          name: `Combien d'avis ${course.title} a-t-il reçu ?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${course.title} a reçu ${analytics.totalReviews} avis d'étudiants qui ont suivi ce cours.`,
          },
        },
        {
          "@type": "Question",
          name: `${course.title} est-il recommandé ?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Avec une note moyenne de ${analytics.averageRating.toFixed(
              1
            )}/5, ${course.title} est ${
              analytics.averageRating >= 4
                ? "hautement recommandé"
                : analytics.averageRating >= 3
                ? "recommandé"
                : "à considérer avec précaution"
            } par les étudiants.`,
          },
        },
      ],
    };
  }

  /**
   * Generate meta tags for review pages
   */
  static generateReviewMetaTags(
    course: { title: string; description?: string; slug?: string },
    analytics: { averageRating: number; totalReviews: number },
    review?: any
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fygs.dev";
    const courseUrl = `${baseUrl}/courses/${course.slug}`;

    if (review) {
      // Individual review meta tags
      const title = `Avis de ${review.user?.name || "un étudiant"} sur ${
        course.title
      } - ${review.rating}/5 étoiles`;
      const description = review.comment
        ? `"${review.comment.slice(0, 140)}${
            review.comment.length > 140 ? "..." : ""
          }" - Avis ${review.rating}/5 étoiles sur ${course.title}.`
        : `Avis ${review.rating}/5 étoiles sur ${course.title} par ${
            review.user?.name || "un étudiant"
          }.`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${courseUrl}/reviews/${review.id}`,
          type: "article",
          images: [
            {
              url: `${baseUrl}/api/og/review?title=${encodeURIComponent(
                course.title
              )}&rating=${review.rating}&author=${encodeURIComponent(
                review.user?.name || "Anonyme"
              )}`,
              width: 1200,
              height: 630,
              alt: `Avis ${review.rating}/5 sur ${course.title}`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [
            `${baseUrl}/api/og/review?title=${encodeURIComponent(
              course.title
            )}&rating=${review.rating}&author=${encodeURIComponent(
              review.user?.name || "Anonyme"
            )}`,
          ],
        },
      };
    } else {
      // Course reviews overview meta tags
      const title = `${analytics.totalReviews} avis sur ${
        course.title
      } - Note moyenne ${analytics.averageRating.toFixed(1)}/5`;
      const description = `Découvrez les ${
        analytics.totalReviews
      } avis d'étudiants sur ${
        course.title
      }. Note moyenne: ${analytics.averageRating.toFixed(1)}/5 étoiles. ${
        course.description ||
        "Lisez les retours authentiques de nos apprenants."
      }`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${courseUrl}/reviews`,
          type: "website",
          images: [
            {
              url: `${baseUrl}/api/og/course-reviews?title=${encodeURIComponent(
                course.title
              )}&rating=${analytics.averageRating.toFixed(1)}&count=${
                analytics.totalReviews
              }`,
              width: 1200,
              height: 630,
              alt: `Avis sur ${course.title}`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [
            `${baseUrl}/api/og/course-reviews?title=${encodeURIComponent(
              course.title
            )}&rating=${analytics.averageRating.toFixed(1)}&count=${
              analytics.totalReviews
            }`,
          ],
        },
      };
    }
  }

  /**
   * Generate sitemap URLs for reviews
   */
  static generateReviewSitemapUrls(
    courses: Array<{ slug: string; updatedAt: Date }>,
    baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || "https://fygs.dev"
  ) {
    return courses.map((course) => ({
      url: `${baseUrl}/courses/${course.slug}/reviews`,
      lastModified: course.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }
}
