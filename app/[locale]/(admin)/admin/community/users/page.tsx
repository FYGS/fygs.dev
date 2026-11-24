import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { Users, Search, Shield, Mail, Calendar, MessageCircle } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Evaluated per request (server component); kept out of the render bodies so that
// the current time is read in a plain helper.
function oneWeekAgo(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

async function getCommunityUsers(q: string) {
  try {
    const search = q.slice(0, 100).replace(/[\\%_]/g, (character) => `\\${character}`);
    const users = await db.user.findMany({
      where: {
        OR: [
          { discussions: { some: {} } },
          { discussionReplies: { some: {} } }
        ],
        ...(search
          ? {
              AND: [
                {
                  OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { email: { contains: search, mode: "insensitive" as const } },
                  ],
                },
              ],
            }
          : {}),
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

async function UsersContent({ q }: { q: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  const users = await getCommunityUsers(q);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Membres de la communauté</h1>
          <p className="text-slate-400">
            Les membres qui ont publié ou répondu. Ouvrez un compte pour changer son rôle ou le suspendre.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/community">
              Retour au tableau de bord
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-950 text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{users.length}</div>
                <div className="text-sm text-slate-400">Membres</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-950 text-green-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {users.filter(u => (u._count.discussions + u._count.discussionReplies) > 0).length}
                </div>
                <div className="text-sm text-slate-400">Contributeurs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-950 text-purple-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {users.filter(u => u.role === "ADMIN" || u.role === "INSTRUCTOR").length}
                </div>
                <div className="text-sm text-slate-400">Équipe</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-950 text-orange-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {users.filter(u => {
                    const lastWeek = oneWeekAgo();
                    return new Date(u.lastActivity) > lastWeek;
                  }).length}
                </div>
                <div className="text-sm text-slate-400">Actifs cette semaine</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" action="/admin/community/users" role="search" className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" aria-hidden="true" />
              <Input name="q" defaultValue={q} aria-label="Nom ou e-mail" placeholder="Nom ou e-mail…" className="pl-10" maxLength={100} />
            </div>
            <Button type="submit" variant="outline">
              Rechercher
            </Button>
            {q && (
              <Button variant="ghost" asChild>
                <Link href="/admin/community/users">Réinitialiser</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Membres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user: any) => (
                <UserItem key={user.id} user={user} />
              ))
            ) : (
              <p className="text-center py-8 text-slate-400">
                Aucun membre trouvé
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
  const isActive = new Date(user.lastActivity) > oneWeekAgo();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-900 text-red-200";
      case "INSTRUCTOR":
        return "bg-purple-900 text-purple-200";
      case "PREMIUM":
        return "bg-yellow-900 text-yellow-200";
      default:
        return "bg-gray-900 text-gray-200";
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
              Actif
            </Badge>
          )}
          {user.isBanned && <Badge variant="destructive">Suspendu</Badge>}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{totalActivity} messages</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Dernière activité {formatDistanceToNow(new Date(user.lastActivity), { addSuffix: true, locale: fr })}</span>
          </div>
        </div>

        {user.topDiscussion && (
          <div className="mt-2 text-sm">
            <span className="text-slate-400">Meilleure discussion : </span>
            <span className="font-medium">{user.topDiscussion.title}</span>
            <span className="text-slate-400">
              {" "}({user.topDiscussion._count.votes} votes, {user.topDiscussion._count.replies} réponses)
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/users/${user.id}`}>Gérer le compte</Link>
        </Button>
      </div>
    </div>
  );
}

export default async function CommunityUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <LoadingSpinner />
        </div>
      }
    >
      <UsersContent q={q} />
    </Suspense>
  );
}