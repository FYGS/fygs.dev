"use client";

import { useState, useEffect } from "react";
import { Bell, BellDot, Check, X, MessageSquare, ThumbsUp, Award, Users, Star, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { markNotificationsAsRead, getNotifications, deleteNotification } from "@/app/actions/community-actions";
import { CommunityNotification } from "@/types/community";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationsDropdownProps {
  initialCount?: number;
  userId?: string;
}

// Notification icon mapping for better visual feedback
const notificationIcons = {
  DISCUSSION_REPLY: MessageSquare,
  DISCUSSION_MENTION: MessageSquare,
  DISCUSSION_UPVOTE: ThumbsUp,
  BADGE_EARNED: Award,
  MENTOR_REQUEST: Star,
  FOLLOW: Users,
  SYSTEM_ANNOUNCEMENT: Megaphone,
};

// Color coding for different notification types
const notificationColors = {
  DISCUSSION_REPLY: "text-blue-600",
  DISCUSSION_MENTION: "text-purple-600",
  DISCUSSION_UPVOTE: "text-green-600",
  BADGE_EARNED: "text-orange-600",
  MENTOR_REQUEST: "text-yellow-600",
  FOLLOW: "text-emerald-600",
  SYSTEM_ANNOUNCEMENT: "text-red-600",
};

export function NotificationsDropdown({ 
  initialCount = 0, 
  userId 
}: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = async () => {
    if (!userId || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await getNotifications(userId, { filter: "all", limit: 15 });
      if (result.success && result.data) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time polling for new notifications every 30 seconds
  useEffect(() => {
    if (!userId) return;

    // Initial load
    queueMicrotask(() => {
      void loadNotifications();
    });

    // Poll for new notifications
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAsRead = async (notificationIds?: string[]) => {
    if (!userId) return;
    
    // If no IDs provided, mark all unread as read
    const idsToMark = notificationIds || 
      notifications.filter(n => !n.isRead).map(n => n.id);
    
    if (idsToMark.length === 0) return;
    
    // Optimistic update
    setNotifications(prev => 
      prev.map(notif => 
        idsToMark.includes(notif.id)
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - idsToMark.length));
    
    try {
      const result = await markNotificationsAsRead(idsToMark);
      if (!result.success) {
        // Revert on error
        loadNotifications();
        toast.error("Failed to mark notifications as read");
      }
    } catch {
      loadNotifications();
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleDelete = async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notifications.find(n => n.id === notificationId && !n.isRead)) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    try {
      const formData = new FormData();
      formData.append("notificationId", notificationId);
      const result = await deleteNotification(formData);
      
      if (!result.success) {
        // Revert on error
        loadNotifications();
        toast.error("Failed to delete notification");
      }
    } catch {
      loadNotifications();
      toast.error("Failed to delete notification");
    }
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && userId) {
      loadNotifications();
    }
  };

  const getNotificationIcon = (type: string) => {
    const IconComponent = notificationIcons[type as keyof typeof notificationIcons];
    return IconComponent || Bell;
  };

  const getNotificationColor = (type: string) => {
    return notificationColors[type as keyof typeof notificationColors] || "text-gray-600";
  };

  const getActionUrl = (notification: CommunityNotification): string | null => {
    const data = notification.data as any;
    
    if (notification.type === "DISCUSSION_REPLY" && data?.discussionId) {
      return `/community/discussions/${data.discussionId}`;
    }
    if (notification.type === "FOLLOW" && data?.followerId) {
      return `/community/users/${data.followerId}`;
    }
    if (notification.type === "BADGE_EARNED") {
      return "/profile";
    }
    if (notification.type === "MENTOR_REQUEST") {
      return "/community/mentorship";
    }
    
    return null;
  };

  if (!userId) {
    return null;
  }

  const NotificationItem = ({ notification }: { notification: CommunityNotification }) => {
    const IconComponent = getNotificationIcon(notification.type);
    const iconColor = getNotificationColor(notification.type);
    const actionUrl = getActionUrl(notification);

    const content = (
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-slate-800 group",
          !notification.isRead && "bg-blue-950/20"
        )}
      >
        <div className="flex-shrink-0">
          {notification.sender?.image ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={notification.sender.image} />
              <AvatarFallback>
                {notification.sender.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={cn("h-8 w-8 rounded-full bg-muted flex items-center justify-center", iconColor)}>
              <IconComponent className="h-4 w-4" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground leading-tight">
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1 leading-tight line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(notification.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );

    if (actionUrl) {
      return (
        <Link 
          href={actionUrl}
          className="block"
          onClick={() => {
            if (!notification.isRead) {
              markAsRead([notification.id]);
            }
            setIsOpen(false);
          }}
        >
          {content}
        </Link>
      );
    }

    return (
      <div 
        className="cursor-pointer"
        onClick={() => {
          if (!notification.isRead) {
            markAsRead([notification.id]);
          }
        }}
      >
        {content}
      </div>
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellDot className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead()}
              className="text-xs h-auto p-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {isLoading && notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                asChild
              >
                <Link href="/community/notifications">
                  View all notifications
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
