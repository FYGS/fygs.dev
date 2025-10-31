import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { Users, Search, Shield, Ban, Mail, Calendar, MessageCircle, Filter } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";

async function getCommunityUsers() {
  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          { discussions: { some: {} } },
          { discussionReplies: { some: {} } }
        ]
      },
      include: {
        _count: {
          select: {
            discussions: true,
            discussionReplies: true,
            discussionVotes: true
          }
        },
        discussions: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1
        },
        discussionReplies: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const userStats = await Promise.all(
      users.map(async (user) => {
        // Find most recent activity
        const lastDiscussion = user.discussions[0]?.createdAt;
        const lastReply = user.discussionReplies[0]?.createdAt;
        
        let lastActivity = user.createdAt;
        if (lastDiscussion && (!lastReply || lastDiscussion > lastReply)) {
          lastActivity = lastDiscussion;
        } else if (lastReply) {
          lastActivity = lastReply;
        }

        // Get top discussion
        const topDiscussion = await db.discussion.findFirst({
          where: { authorId: user.id },
          include: {
            _count: { select: { votes: true, replies: true } }
          },
          orderBy: {
            votes: { _count: "desc" }
          }
        });

        return {
          ...user,
          lastActivity,
          topDiscussion
        };
      })
    );

    return userStats;
  } catch (error) {
    console.error("Error fetching community users:", error);
    return [];
  }
}

async function UsersContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  const users = await getCommunityUsers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Users</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage community members and their permissions
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{users.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {users.filter(u => (u._count.discussions + u._count.discussionReplies) > 0).length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Active Contributors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {users.filter(u => u.role === "ADMIN" || u.role === "INSTRUCTOR").length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Staff Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {users.filter(u => {
                    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return new Date(u.lastActivity) > lastWeek;
                  }).length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Active This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Community Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user: any) => (
                <UserItem key={user.id} user={user} />
              ))
            ) : (
              <p className="text-center py-8 text-slate-600 dark:text-slate-400">
                No community users found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserItem({ user }: { user: any }) {
  const totalActivity = user._count.discussions + user._count.discussionReplies;
  const isActive = new Date(user.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "INSTRUCTOR":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "PREMIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.image || ""} alt={user.name || ""} />
        <AvatarFallback>
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium truncate">{user.name}</h3>
          <Badge className={getRoleColor(user.role)} variant="secondary">
            {user.role}
          </Badge>
          {isActive && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{totalActivity} posts</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Last active {formatDistanceToNow(new Date(user.lastActivity), { addSuffix: true })}</span>
          </div>
        </div>

        {user.topDiscussion && (
          <div className="mt-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Top discussion: </span>
            <span className="font-medium">{user.topDiscussion.title}</span>
            <span className="text-slate-500 dark:text-slate-400">
              {" "}({user.topDiscussion._count.votes} votes, {user.topDiscussion._count.replies} replies)
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/users/${user.id}`}>
            View Profile
          </Link>
        </Button>
        
        {user.role !== "ADMIN" && (
          <>
            <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
              <Shield className="h-4 w-4 mr-1" />
              Moderate
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Ban className="h-4 w-4 mr-1" />
              Suspend
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CommunityUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <LoadingSpinner />
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}