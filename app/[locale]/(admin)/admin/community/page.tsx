import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { Users, MessageCircle, AlertTriangle, TrendingUp, Filter, Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

async function getCommunityStats() {
  try {
    const [
      totalDiscussions,
      totalReplies,
      totalUsers,
      totalTopics,
      recentDiscussions,
      reportedContent,
      activeUsers,
      topTopics
    ] = await Promise.all([
      // Total discussions
      db.discussion.count(),
      
      // Total replies
      db.discussionReply.count(),
      
      // Total community users (users with discussions or replies)
      db.user.count({
        where: {
          OR: [
            { discussions: { some: {} } },
            { discussionReplies: { some: {} } }
          ]
        }
      }),
      
      // Total topics
      db.topic.count(),
      
      // Recent discussions (last 7 days)
      db.discussion.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          author: { select: { id: true, name: true, image: true } },
          topic: { select: { name: true, icon: true } },
          _count: { select: { replies: true, votes: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      
      // Reported content (placeholder - would need reporting system)
      Promise.resolve(0),
      
      // Active users (last 30 days)
      db.user.count({
        where: {
          OR: [
            {
              discussions: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            },
            {
              discussionReplies: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            }
          ]
        }
      }),
      
      // Top topics by discussion count
      db.topic.findMany({
        include: {
          _count: { select: { discussions: true, followers: true } }
        },
        orderBy: {
          discussions: { _count: "desc" }
        },
        take: 5
      })
    ]);

    return {
      totalDiscussions,
      totalReplies,
      totalUsers,
      totalTopics,
      recentDiscussions,
      reportedContent,
      activeUsers,
      topTopics
    };
  } catch (error) {
    console.error("Error fetching community stats:", error);
    return {
      totalDiscussions: 0,
      totalReplies: 0,
      totalUsers: 0,
      totalTopics: 0,
      recentDiscussions: [],
      reportedContent: 0,
      activeUsers: 0,
      topTopics: []
    };
  }
}

async function CommunityDashboardContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  const stats = await getCommunityStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Administration</h1>
          <p className="text-slate-400">
            Manage discussions, users, and community content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/community/topics">
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/community/moderation">
              <Filter className="h-4 w-4 mr-2" />
              Moderation Queue
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Discussions"
          value={stats.totalDiscussions}
          icon={MessageCircle}
          color="blue"
        />
        <StatsCard
          title="Total Replies"
          value={stats.totalReplies}
          icon={MessageCircle}
          color="green"
        />
        <StatsCard
          title="Community Members"
          value={stats.totalUsers}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Active Topics"
          value={stats.totalTopics}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Discussions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentDiscussions.length > 0 ? (
                stats.recentDiscussions.map((discussion: any) => (
                  <div key={discussion.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {discussion.topic?.icon && (
                          <span className="text-sm">{discussion.topic.icon}</span>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {discussion.topic?.name}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm truncate">{discussion.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>by {discussion.author?.name}</span>
                        <span>•</span>
                        <span>{discussion._count?.replies || 0} replies</span>
                        <span>•</span>
                        <span>{discussion._count?.votes || 0} votes</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/community/discussions/${discussion.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-slate-400">
                  No recent discussions
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topTopics.length > 0 ? (
                stats.topTopics.map((topic: any) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                    <div className="flex items-center gap-3">
                      {topic.icon && (
                        <span className="text-lg">{topic.icon}</span>
                      )}
                      <div>
                        <div className="font-medium">{topic.name}</div>
                        <div className="text-sm text-slate-400">
                          {topic._count?.discussions || 0} discussions • {topic._count?.followers || 0} followers
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/community/topics/${topic.id}`}>
                        Manage
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-slate-400">
                  No topics found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard
          title="Content Moderation"
          description="Review reported content and manage discussions"
          href="/admin/community/moderation"
          icon={AlertTriangle}
          color="red"
        />
        <ActionCard
          title="User Management"
          description="Manage community members and permissions"
          href="/admin/community/users"
          icon={Users}
          color="blue"
        />
        <ActionCard
          title="Analytics"
          description="View community engagement metrics"
          href="/admin/community/analytics"
          icon={TrendingUp}
          color="green"
        />
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "orange";
}

function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-950 text-blue-400",
    green: "bg-green-950 text-green-400",
    purple: "bg-purple-950 text-purple-400",
    orange: "bg-orange-950 text-orange-400"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-lg", colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            <div className="text-sm text-slate-400">{title}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "red";
}

function ActionCard({ title, description, href, icon: Icon, color }: ActionCardProps) {
  const colorClasses = {
    blue: "bg-blue-950 text-blue-400",
    green: "bg-green-950 text-green-400",
    red: "bg-red-950 text-red-400"
  };

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-lg", colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-slate-400">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CommunityAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <LoadingSpinner />
        </div>
      }
    >
      <CommunityDashboardContent />
    </Suspense>
  );
}