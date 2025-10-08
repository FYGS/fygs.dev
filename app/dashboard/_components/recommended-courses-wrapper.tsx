"use client";
import React, { useCallback } from 'react';

interface ClientProps {
  children: React.ReactNode;
}

export function RecommendedCoursesClient({ children }: ClientProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const wrapper = target.closest('[data-course-id][data-reco-rank]') as HTMLElement | null;
    if (wrapper && navigator.sendBeacon) {
      const courseId = wrapper.getAttribute('data-course-id');
      const rank = Number(wrapper.getAttribute('data-reco-rank'));
      if (courseId) {
        navigator.sendBeacon('/api/analytics/recommendation-click', JSON.stringify({ courseId, rank }));
      }
    }
  }, []);

  return <div onClick={handleClick}>{children}</div>;
}
