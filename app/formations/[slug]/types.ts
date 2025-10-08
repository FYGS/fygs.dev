export interface SerializedCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  category: string;
  level: string;
  published: boolean;
  featured: boolean;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  lessons: SerializedLesson[];
  reviews: SerializedReview[];
  tags: SerializedCourseTag[];
  enrollments: SerializedEnrollment[];
  // Enriched access flags (optional)
  isUnlocked?: boolean;
  isInSubscription?: boolean;
  isEnrolled?: boolean;
  hasEntitlement?: boolean;
}

export interface SerializedLesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number | null;
  order: number;
}

export interface SerializedReview {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    image: string | null;
  };
}

export interface SerializedCourseTag {
  tag: {
    id: string;
    name: string;
    color: string;
  };
}

export interface SerializedEnrollment {
  id: string;
}
