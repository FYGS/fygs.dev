"use client";

import { CoursePaymentForm } from "@/app/_components/payment/course-payment-form";

interface CourseEnrollmentProps {
  course: {
    id: string;
    slug: string;
    title: string;
    price: number;
    level: string;
    /** Total of the lesson durations, in minutes. */
    duration: number;
    enrollmentCount: number;
    averageRating: number;
  };
  isEnrolled?: boolean;
  canPreview?: boolean;
  hasPurchased?: boolean; // User has entitlement via subscription or course purchase
}

export function CourseEnrollment({ course, isEnrolled = false, canPreview = false, hasPurchased = false }: CourseEnrollmentProps) {
  return <CoursePaymentForm course={course} isEnrolled={isEnrolled} canPreview={canPreview} hasPurchased={hasPurchased} />;
}
