import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { Users, MessageCircle, Heart, ArrowUp, ArrowDown } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

async function getAnalyticsData() {
  try {
    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const thisWeekEnd = endOfWeek(now);
    const lastWeekStart = startOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const lastWeekEnd = endOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    const [
      // Current totals
      totalDiscussions,
      totalReplies,
      totalUsers,
      totalVotes,

      // This week stats
      thisWeekDiscussions,
      thisWeekReplies,
      thisWeekUsers,
      thisWeekVotes,

      // Last week stats
      lastWeekDiscussions,
      lastWeekReplies,
      lastWeekUsers,
      lastWeekVotes,

      // Top content
      topDiscussions,
      topUsers,
      topTopics,
      
      // Engagement data
      recentActivity
    ] = await Promise.all([
      // Current totals
      db.discussion.count(),
      db.discussionReply.count(),
      db.user.count({
        where: {
          OR: [
            { discussions: { some: {} } },
            { discussionReplies: { some: {} } }
          ]
        }
      }),
      db.discussionVote.count(),

      // This week
      db.discussion.count({
        where: { createdAt: { gte: thisWeekStart, lte: thisWeekEnd } }
      }),
      db.discussionReply.count({
        where: { createdAt: { gte: thisWeekStart, lte: thisWeekEnd } }
      }),
      db.user.count({
        where: {
          OR: [
            { discussions: { some: { createdAt: { gte: thisWeekStart, lte: thisWeekEnd } } } },
            { discussionReplies: { some: { createdAt: { gte: thisWeekStart, lte: thisWeekEnd } } } }
          ]
        }
      }),
      db.discussionVote.count({
        where: { createdAt: { gte: thisWeekStart, lte: thisWeekEnd } }
      }),

      // Last week
      db.discussion.count({
        where: { createdAt: { gte: lastWeekStart, lte: lastWeekEnd } }
      }),
      db.discussionReply.count({
        where: { createdAt: { gte: lastWeekStart, lte: lastWeekEnd } }
      }),
      db.user.count({
        where: {
          OR: [
            { discussions: { some: { createdAt: { gte: lastWeekStart, lte: lastWeekEnd } } } },
            { discussionReplies: { some: { createdAt: { gte: lastWeekStart, lte: lastWeekEnd } } } }
          ]
        }
      }),
      db.discussionVote.count({
        where: { createdAt: { gte: lastWeekStart, lte: lastWeekEnd } }
      }),

      // Top discussions by votes
      db.discussion.findMany({
        where: {
          createdAt: { gte: thisMonthStart, lte: thisMonthEnd }
        },
        include: {
          author: { select: { name: true, image: true } },
          topic: { select: { name: true, icon: true } },
          _count: { select: { replies: true, votes: true } }
        },
        orderBy: { votes: { _count: "desc" } },
        take: 10
      }),

      // Top users by activity
      db.user.findMany({
        where: {
          OR: [
            { discussions: { some: { createdAt: { gte: thisMonthStart } } } },
            { discussionReplies: { some: { createdAt: { gte: thisMonthStart } } } }
          ]
        },
        include: {
          _count: {
            select: {
              discussions: { where: { createdAt: { gte: thisMonthStart } } },
              discussionReplies: { where: { createdAt: { gte: thisMonthStart } } }
            }
          }
        },
        take: 10
      }),

      // Top topics by activity
      db.topic.findMany({
        include: {
          _count: {
            select: {
              discussions: { where: { createdAt: { gte: thisMonthStart } } },
              followers: true
            }
          }
        },
        orderBy: {
          discussions: { _count: "desc" }
        },
        take: 10
      }),

      // Recent activity for engagement chart
      db.discussion.findMany({
        where: {
          createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        },
        select: { createdAt: true },
        orderBy: { createdAt: "desc" }
      })
    ]);

    // Calculate growth percentages
    const discussionsGrowth = lastWeekDiscussions > 0 
      ? ((thisWeekDiscussions - lastWeekDiscussions) / lastWeekDiscussions) * 100 
      : thisWeekDiscussions > 0 ? 100 : 0;
    
    const repliesGrowth = lastWeekReplies > 0 
      ? ((thisWeekReplies - lastWeekReplies) / lastWeekReplies) * 100 
      : thisWeekReplies > 0 ? 100 : 0;
    
    const usersGrowth = lastWeekUsers > 0 
      ? ((thisWeekUsers - lastWeekUsers) / lastWeekUsers) * 100 
      : thisWeekUsers > 0 ? 100 : 0;
    
    const votesGrowth = lastWeekVotes > 0 
      ? ((thisWeekVotes - lastWeekVotes) / lastWeekVotes) * 100 
      : thisWeekVotes > 0 ? 100 : 0;

    return {
      totals: { totalDiscussions, totalReplies, totalUsers, totalVotes },
      thisWeek: { thisWeekDiscussions, thisWeekReplies, thisWeekUsers, thisWeekVotes },
      growth: { discussionsGrowth, repliesGrowth, usersGrowth, votesGrowth },
      topDiscussions,
      topUsers,
      topTopics,
      recentActivity
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      totals: { totalDiscussions: 0, totalReplies: 0, totalUsers: 0, totalVotes: 0 },
      thisWeek: { thisWeekDiscussions: 0, thisWeekReplies: 0, thisWeekUsers: 0, thisWeekVotes: 0 },
      growth: { discussionsGrowth: 0, repliesGrowth: 0, usersGrowth: 0, votesGrowth: 0 },
      topDiscussions: [],
      topUsers: [],
      topTopics: [],
      recentActivity: []
    };
  }
}

async function AnalyticsContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Analytics</h1>
          <p className="text-slate-400">
            Track community engagement and growth metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/community">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Discussions"
          value={data.totals.totalDiscussions}
          thisWeek={data.thisWeek.thisWeekDiscussions}
          growth={data.growth.discussionsGrowth}
          icon={MessageCircle}
          color="blue"
        />
        <MetricCard
          title="Total Replies"
          value={data.totals.totalReplies}
          thisWeek={data.thisWeek.thisWeekReplies}
          growth={data.growth.repliesGrowth}
          icon={MessageCircle}
          color="green"
        />
        <MetricCard
          title="Active Users"
          value={data.totals.totalUsers}
          thisWeek={data.thisWeek.thisWeekUsers}
          growth={data.growth.usersGrowth}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Total Votes"
          value={data.totals.totalVotes}
          thisWeek={data.thisWeek.thisWeekVotes}
          growth={data.growth.votesGrowth}
          icon={Heart}
          color="red"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Discussions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Discussions (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topDiscussions.length > 0 ? (
                data.topDiscussions.map((discussion: any, index: number) => (
                  <div key={discussion.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-sm font-medium">
                      {index + 1}
                    </div>
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
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-slate-400">
                  No discussions this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Users (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topUsers.length > 0 ? (
                data.topUsers
                  .sort((a: any, b: any) => 
                    (b._count.discussions + b._count.discussionReplies) - 
                    (a._count.discussions + a._count.discussionReplies)
                  )
                  .slice(0, 10)
                  .map((user: any, index: number) => {
                    const totalActivity = user._count.discussions + user._count.discussionReplies;
                    return (
                      <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-slate-400">
                            {user._count.discussions} discussions • {user._count.discussionReplies} replies
                          </div>
                        </div>
                        <Badge variant="outline">{totalActivity} posts</Badge>
                      </div>
                    );
                  })
              ) : (
                <p className="text-center py-4 text-slate-400">
                  No active users this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Popular Topics (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.topTopics.length > 0 ? (
                data.topTopics.map((topic: any) => (
                  <div key={topic.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    <Progress 
                      value={Math.min((topic._count?.discussions || 0) * 10, 100)} 
                      className="w-20" 
                    />
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-slate-400 md:col-span-2">
                  No topic activity this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm text-slate-400 mb-4">
                Total activity: {data.recentActivity.length} discussions
              </div>
              <div className="h-16 bg-slate-900 rounded flex items-end gap-1 p-2">
                {/* Simple activity visualization */}
                {Array.from({ length: 30 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (29 - i));
                  const dayActivity = data.recentActivity.filter((activity: any) => {
                    const activityDate = new Date(activity.createdAt);
                    return activityDate.toDateString() === date.toDateString();
                  }).length;
                  
                  const maxHeight = Math.max(...Array.from({ length: 30 }, (_, j) => {
                    const checkDate = new Date();
                    checkDate.setDate(checkDate.getDate() - (29 - j));
                    return data.recentActivity.filter((activity: any) => {
                      const activityDate = new Date(activity.createdAt);
                      return activityDate.toDateString() === checkDate.toDateString();
                    }).length;
                  }));
                  
                  const height = maxHeight > 0 ? (dayActivity / maxHeight) * 100 : 0;
                  
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-blue-800 rounded-sm min-h-[4px]"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${date.toLocaleDateString("fr-FR")}: ${dayActivity} discussions`}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-slate-400">
              No recent activity data available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  thisWeek: number;
  growth: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "red";
}

function MetricCard({ title, value, thisWeek, growth, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: "bg-blue-950 text-blue-400",
    green: "bg-green-950 text-green-400",
    purple: "bg-purple-950 text-purple-400",
    red: "bg-red-950 text-red-400"
  };

  const isPositiveGrowth = growth >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-lg", colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-sm",
            isPositiveGrowth ? "text-green-600" : "text-red-600"
          )}>
            {isPositiveGrowth ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            {Math.abs(growth).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold">{value.toLocaleString("fr-FR")}</div>
          <div className="text-sm text-slate-400">{title}</div>
          <div className="text-xs text-slate-500 mt-1">
            {thisWeek} this week
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <LoadingSpinner />
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}