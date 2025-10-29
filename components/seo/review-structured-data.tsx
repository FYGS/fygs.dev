"use client";

import Script from "next/script";
import { Review, User, Course } from "@prisma/client";
import { ReviewSEOService } from "@/lib/services/review-seo";

type ReviewWithAuthor = Review & {
  author: User;
};

interface ReviewStructuredDataProps {
  review: ReviewWithAuthor;
  course: Course;
}

/**
 * Component to inject structured data for individual reviews
 */
export function ReviewStructuredData({ review, course }: ReviewStructuredDataProps) {
  const schema = ReviewSEOService.generateReviewSchema(
    {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      user: {
        name: review.author.name,
        image: review.author.image,
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    },
    {
      title: course.title,
      description: course.description || "",
      slug: course.slug,
    }
  );

  return (
    <Script
      id="review-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

interface CourseReviewsStructuredDataProps {
  course: Course;
  reviews: ReviewWithAuthor[];
  averageRating: number;
  totalReviews: number;
  instructor?: {
    name: string;
  };
}

/**
 * Component to inject structured data for course reviews overview
 */
export function CourseReviewsStructuredData({
  course,
  reviews,
  averageRating,
  totalReviews,
  instructor,
}: CourseReviewsStructuredDataProps) {
  // Generate aggregate rating schema
  const aggregateRatingSchema = ReviewSEOService.generateCourseAggregateRatingSchema(
    course,
    {
      averageRating,
      totalReviews,
      ratingDistribution: {
        1: reviews.filter(r => r.rating === 1).length,
        2: reviews.filter(r => r.rating === 2).length,
        3: reviews.filter(r => r.rating === 3).length,
        4: reviews.filter(r => r.rating === 4).length,
        5: reviews.filter(r => r.rating === 5).length,
      },
    },
    reviews,
    instructor
  );
  
  // Generate breadcrumb schema
  const breadcrumbSchema = ReviewSEOService.generateBreadcrumbSchema([
    { name: "Accueil", url: "/" },
    { name: "Formations", url: "/courses" },
    { name: course.title, url: `/courses/${course.slug}` },
    { name: "Avis étudiants", url: `/courses/${course.slug}/reviews` },
  ]);
  
  // Generate FAQ schema from common review themes
  const faqSchema = ReviewSEOService.generateReviewFAQSchema(course, {
    averageRating,
    totalReviews,
  });
  
  // Combine all schemas
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      aggregateRatingSchema,
      breadcrumbSchema,
      faqSchema,
    ],
  };

  return (
    <Script
      id="course-reviews-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(combinedSchema),
      }}
    />
  );
}

interface ReviewFAQStructuredDataProps {
  commonQuestions: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * Component to inject FAQ structured data for review-related questions
 */
export function ReviewFAQStructuredData({
  commonQuestions,
}: ReviewFAQStructuredDataProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: commonQuestions.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="review-faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema),
      }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Component to inject breadcrumb structured data
 */
export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const schema = ReviewSEOService.generateBreadcrumbSchema(items);

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}