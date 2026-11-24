import type { Course, Enrollment, User } from "../../lib/generated/prisma/browser";

/** Enrollment as returned with `include: { course: true, user: true }`. */
export type EnrollmentWithRelations = Enrollment & {
  course: Course;
  user: User;
};
