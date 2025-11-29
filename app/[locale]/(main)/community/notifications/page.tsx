import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Bell, Check } from "lucide-react";

import { auth } from "@/lib/auth";
import { getNotifications, markNotificationsAsRead } from "@/app/actions/community-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface NotificationsPageProps {
  searchParams: Promise<{
    filter?: "all" | "unread" | "read";
    page?: string;
  }>;
}

async function NotificationsContent({ searchParams }: NotificationsPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/community/notifications");
  }

  const filter = resolvedSearchParams.filter || "all";
  const page = parseInt(resolvedSearchParams.page || "1");

  try {
    const notificationsResult = await getNotifications(session.user.id, {
      filter,
      page,
      limit: 20,
    });

    const notifications = notificationsResult.success ? notificationsResult.data || [] : [];
    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    const handleMarkAllRead = async () => {
      try {
        await markNotificationsAsRead(notifications.map((n: any) => n.id));
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    };

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/community" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Community
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-6 w-6" />
                  <h1 className="text-2xl font-bold">Notifications</h1>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-slate-400">
                  Stay updated with community activities
                </p>
              </div>

              {unreadCount > 0 && (
                <form action={handleMarkAllRead}>
                  <Button variant="outline" size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Mark all read
                  </Button>
                </form>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href="/community/notifications?filter=all">All</Link>
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href="/community/notifications?filter=unread">
                  Unread ({unreadCount})
                </Link>
              </Button>
              <Button
                variant={filter === "read" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href="/community/notifications?filter=read">Read</Link>
              </Button>
            </div>

            {/* Notifications List */}
            <Card>
              <CardContent className="p-0">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-slate-400">
                      {filter === "unread" 
                        ? "All caught up! No unread notifications."
                        : "You'll see notifications here when there's activity."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification: any) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-accent/50 transition-colors ${
                          !notification.isRead ? "bg-blue-950/20" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={notification.sender?.image || ""} />
                            <AvatarFallback className="text-xs">
                              {notification.sender?.name?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">
                                    {notification.sender?.name || "Someone"}
                                  </span>{" "}
                                  {notification.message}
                                </p>
                                
                                {notification.data?.relatedDiscussionId && (
                                  <Link
                                    href={`/community/discussions/${notification.data.relatedDiscussionId}`}
                                    className="text-sm text-primary hover:underline mt-1 block"
                                  >
                                    View related discussion
                                  </Link>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                <span className="text-xs text-slate-500">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination would go here if needed */}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading notifications:", error);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Error Loading Notifications</h1>
            <p className="text-slate-400">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default function NotificationsPage({ searchParams }: NotificationsPageProps) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-6">
            <LoadingSpinner />
          </div>
        </div>
      }
    >
      <NotificationsContent searchParams={searchParams} />
    </Suspense>
  );
}