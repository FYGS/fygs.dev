"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface NotificationProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    className: "border-green-800 bg-green-900/20 text-green-200",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-800 bg-red-900/20 text-red-200",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-800 bg-yellow-900/20 text-yellow-200",
  },
  info: {
    icon: Info,
    className: "border-blue-800 bg-blue-900/20 text-blue-200",
  },
};

export function Notification({
  id,
  type,
  title,
  message,
  onClose,
}: NotificationProps) {
  const config = notificationConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.25, 0, 1] }}
      className={cn(
        "relative p-4 rounded-lg border shadow-lg backdrop-blur-xs",
        "max-w-sm w-full pointer-events-auto",
        config.className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-70 hover:opacity-100 -mt-1 -mr-1"
          onClick={() => onClose(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export function NotificationContainer({
  notifications,
  onClose,
}: {
  notifications: NotificationProps[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
