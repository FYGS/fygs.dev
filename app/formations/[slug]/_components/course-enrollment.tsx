"use client";

import { CoursePaymentForm } from "@/app/_components/payment/course-payment-form";
import { SerializedCourse } from "../types";

interface CourseEnrollmentProps {
  course: SerializedCourse;
  isEnrolled?: boolean;
  canPreview?: boolean;
}

export function CourseEnrollment({ course, isEnrolled = false, canPreview = false }: CourseEnrollmentProps) {
  return <CoursePaymentForm course={course} isEnrolled={isEnrolled} canPreview={canPreview} />;
}
