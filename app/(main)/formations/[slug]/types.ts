export interface SerializedQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  order: number;
}

export interface SerializedQuiz {
  id: string;
  moduleId: number;
  title: string;
  questions: SerializedQuizQuestion[];
}

export interface SerializedVisualSupport {
  id: string;
  title: string;
  moduleId: number;
  order: number;
  content: { slides: Array<{ title: string; content: any }> };
}

export interface SerializedModule {
  id: string;
  title: string;
  slug: string;
  order: number;
  courseId: string;
  lessons: SerializedLesson[];
}

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
  modules: SerializedModule[];
  lessons: SerializedLesson[]; // Keep for backward compatibility
  quizzes?: SerializedQuiz[];
  visualSupports?: SerializedVisualSupport[];
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
  moduleId: string | null;
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
