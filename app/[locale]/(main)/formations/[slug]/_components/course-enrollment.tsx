"use client";

import { CoursePaymentForm } from "@/app/_components/payment/course-payment-form";
import { SerializedCourse } from "../types";

interface CourseEnrollmentProps {
  course: SerializedCourse;
  isEnrolled?: boolean;
  canPreview?: boolean;
  hasPurchased?: boolean; // User has entitlement via subscription or course purchase
}

export function CourseEnrollment({ course, isEnrolled = false, canPreview = false, hasPurchased = false }: CourseEnrollmentProps) {
  return <CoursePaymentForm course={course} isEnrolled={isEnrolled} canPreview={canPreview} hasPurchased={hasPurchased} />;
}
