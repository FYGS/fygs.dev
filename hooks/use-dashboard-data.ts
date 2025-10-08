"use client";

import { useState, useEffect, useMemo } from "react";
import { useNotificationStore } from "@/lib/notification-store";

interface DashboardData {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  currentStreak: number;
  totalStudyTime: number;
  recentActivity: any[];
  isLoading: boolean;
  error: string | null;
  completionRate: number;
  lessonCompletionRate: number;
  averageStudyTimePerDay: number;
}

export function useDashboardData(userId: string): DashboardData {
  const [data, setData] = useState<Partial<DashboardData>>({
    isLoading: true,
    error: null,
  });

  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!userId) return;

    let isCancelled = false;

    const fetchDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Simulate API calls - replace with real API endpoints
        const [coursesRes, progressRes, activityRes] = await Promise.all([
          fetch(`/api/dashboard/courses?userId=${userId}`).catch(() => null),
          fetch(`/api/dashboard/progress?userId=${userId}`).catch(() => null),
          fetch(`/api/dashboard/activity?userId=${userId}`).catch(() => null),
        ]);

        if (isCancelled) return;

        // Mock data for now - replace with real API responses
        const mockData = {
          totalCourses: 12,
          completedCourses: 3,
          totalLessons: 156,
          completedLessons: 47,
          currentStreak: 7,
          totalStudyTime: 2340, // minutes
          recentActivity: [
            {
              id: "1",
              type: "lesson_completed",
              title: "Introduction à React Hooks",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
              id: "2", 
              type: "course_started",
              title: "Next.js 15 Avancé",
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          ],
          isLoading: false,
          error: null,
        };

        if (!isCancelled) {
          setData(mockData);
        }
      } catch (error) {
        if (!isCancelled) {
          const errorMessage = "Erreur lors du chargement des données";
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }));
          
          addNotification({
            type: "error",
            title: "Erreur de chargement",
            message: errorMessage,
            duration: 5000,
          });
        }
      }
    };

    fetchDashboardData();

    return () => {
      isCancelled = true;
    };
  }, [userId, addNotification]);

  // Memoized computed values
  const computedData = useMemo(() => {
    const completionRate = data.totalCourses 
      ? Math.round((data.completedCourses || 0) / data.totalCourses * 100)
      : 0;
    
    const lessonCompletionRate = data.totalLessons
      ? Math.round((data.completedLessons || 0) / data.totalLessons * 100)
      : 0;

    const averageStudyTimePerDay = data.totalStudyTime
      ? Math.round(data.totalStudyTime / 30) // Last 30 days
      : 0;

    return {
      completionRate,
      lessonCompletionRate,
      averageStudyTimePerDay,
    };
  }, [data.totalCourses, data.completedCourses, data.totalLessons, data.completedLessons, data.totalStudyTime]);

  return {
    totalCourses: data.totalCourses || 0,
    completedCourses: data.completedCourses || 0,
    totalLessons: data.totalLessons || 0,
    completedLessons: data.completedLessons || 0,
    currentStreak: data.currentStreak || 0,
    totalStudyTime: data.totalStudyTime || 0,
    recentActivity: data.recentActivity || [],
    isLoading: data.isLoading || false,
    error: data.error || null,
    completionRate: computedData.completionRate,
    lessonCompletionRate: computedData.lessonCompletionRate,
    averageStudyTimePerDay: computedData.averageStudyTimePerDay,
  };
}
