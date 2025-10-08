"use client";

import { create } from "zustand";
import { NotificationProps } from "@/components/ui/notification";

interface NotificationStore {
  notifications: NotificationProps[];
  addNotification: (notification: Omit<NotificationProps, "id" | "onClose">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: (id: string) => get().removeNotification(id),
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ notifications: [] });
  },
}));

// Helper functions for common notification types
export const notify = {
  success: (title: string, message?: string, duration?: number) => {
    useNotificationStore.getState().addNotification({
      type: "success",
      title,
      message,
      duration,
    });
  },
  
  error: (title: string, message?: string, duration?: number) => {
    useNotificationStore.getState().addNotification({
      type: "error",
      title,
      message,
      duration,
    });
  },
  
  warning: (title: string, message?: string, duration?: number) => {
    useNotificationStore.getState().addNotification({
      type: "warning",
      title,
      message,
      duration,
    });
  },
  
  info: (title: string, message?: string, duration?: number) => {
    useNotificationStore.getState().addNotification({
      type: "info",
      title,
      message,
      duration,
    });
  },
};
