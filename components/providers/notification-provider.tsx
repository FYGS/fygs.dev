"use client";

import { NotificationContainer } from "@/components/ui/notification";
import { useNotificationStore } from "@/lib/notification-store";

export function NotificationProvider() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <NotificationContainer
      notifications={notifications}
      onClose={removeNotification}
    />
  );
}
