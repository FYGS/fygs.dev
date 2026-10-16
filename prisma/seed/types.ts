import type { Course, Enrollment, User } from "@prisma/client";

/** Enrollment as returned with `include: { course: true, user: true }`. */
export type EnrollmentWithRelations = Enrollment & {
  course: Course;
  user: User;
};
