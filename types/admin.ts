// Admin type definitions for better TypeScript support
import {
  CourseCategory,
  CourseLevel,
  CourseAccessTier,
  Role,
} from "@prisma/client";

// Session types
export interface SessionUser {
  id: string;
  role: Role;
  email: string;
  name: string;
}

export interface AuthSession {
  user: SessionUser;
}

// Course data types
export interface CourseData {
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  accessTier: CourseAccessTier;
  published: boolean;
  featured: boolean;
  previewEnabled: boolean;
  price?: number | null;
  duration?: number | null;
  thumbnail?: string | null;
  instructorId?: string | null;
  publicStructure?: string | null;
  publicResources?: string | null;
  publicEvaluation?: string | null;
  publicPrerequisites?: string | null;
}

// Query types for database operations
export interface CourseQueryOptions {
  select?: Record<string, boolean | Record<string, unknown>>;
  where?: Record<string, unknown>;
  orderBy?: Record<string, string> | Record<string, string>[];
  include?: Record<string, boolean | Record<string, unknown>>;
}

export interface LessonQueryOptions {
  select?: Record<string, boolean | Record<string, unknown>>;
  where?: Record<string, unknown>;
  orderBy?: Record<string, string> | Record<string, string>[];
  include?: Record<string, boolean | Record<string, unknown>>;
}

// API Response types
export interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface CourseCreateResponse extends ActionResponse {
  courseId?: string;
}

export interface LessonCreateResponse extends ActionResponse {
  lessonId?: string;
}

// Statistics types
export interface AdminStats {
  total: number;
  published: number;
  featured: number;
  draft: number;
  totalLessons: number;
  totalEnrollments: number;
}

// Pagination types
export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
