import { Metadata } from "next";
import { Review, User, Course } from "@prisma/client";
import { ReviewSEOService } from "@/lib/services/review-seo";

type ReviewWithAuthor = Review & {
  author: User;
};

interface ReviewMetaTagsProps {
  review: ReviewWithAuthor;
  course: Course;
}

/**
 * Generate metadata for individual review pages
 */
export function generateReviewMetadata({
  review,
  course,
}: ReviewMetaTagsProps): Metadata {
  const metaTags = ReviewSEOService.generateReviewMetaTags(
    {
      title: course.title,
      description: course.description || "",
      slug: course.slug,
    },
    {
      averageRating: review.rating,
      totalReviews: 1,
    },
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
    }
  );
  
  return {
    title: metaTags.title,
    description: metaTags.description,
    
    openGraph: {
      title: metaTags.openGraph.title,
      description: metaTags.openGraph.description,
      type: "article",
      url: metaTags.openGraph.url,
      images: metaTags.openGraph.images,
      siteName: "FYGS DEV",
    },
    
    twitter: {
      card: metaTags.twitter.card as "summary_large_image",
      title: metaTags.twitter.title,
      description: metaTags.twitter.description,
      images: metaTags.twitter.images,
      creator: "@fygsdev",
    },
    
    alternates: {
      canonical: metaTags.openGraph.url,
    },
    
    other: {
      "article:author": review.author.name,
      "article:published_time": review.createdAt.toISOString(),
      "article:modified_time": review.updatedAt.toISOString(),
      "article:section": "Avis étudiants",
      "article:tag": `Avis,Formation,${course.title}`,
    },
  };
}

interface CourseReviewsMetaTagsProps {
  course: Course;
  averageRating: number;
  totalReviews: number;
  instructor?: {
    name: string;
  };
}

/**
 * Generate metadata for course reviews overview pages
 */
export function generateCourseReviewsMetadata({
  course,
  averageRating,
  totalReviews,
  instructor,
}: CourseReviewsMetaTagsProps): Metadata {
  const title = `Avis étudiants : ${course.title} - ${averageRating.toFixed(1)}/5 (${totalReviews} avis)`;
  const description = `Découvrez les ${totalReviews} avis étudiants sur la formation "${course.title}"${instructor ? ` par ${instructor.name}` : ""}. Note moyenne : ${averageRating.toFixed(1)}/5 étoiles.`;
  
  const ogImageUrl = `/api/og/course-reviews?title=${encodeURIComponent(course.title)}&rating=${averageRating}&count=${totalReviews}${instructor ? `&instructor=${encodeURIComponent(instructor.name)}` : ""}`;
  
  return {
    title,
    description,
    keywords: `avis,étudiants,formation,${course.title},cours en ligne,FYGS Academy`,
    
    openGraph: {
      title,
      description,
      type: "website",
      url: `/courses/${course.slug}/reviews`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Avis étudiants sur ${course.title}`,
        },
      ],
      siteName: "FYGS DEV",
    },
    
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
      creator: "@fygsdev",
    },
    
    alternates: {
      canonical: `/courses/${course.slug}/reviews`,
    },
  };
}