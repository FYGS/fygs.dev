"use client";

import { useState } from "react";
import { 
  Users, 
  MessageSquare, 
  Flag, 
  Trash2, 
  Eye, 
  EyeOff, 
  Shield, 
  ChevronDown,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  moderateContent, 
  updateUserRole, 
  deleteDiscussion, 
  deleteReply,
  banUser,
  unbanUser
} from "@/app/actions/community-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "USER" | "MENTOR" | "MODERATOR" | "ADMIN";
  isActive: boolean;
  isBanned: boolean;
  joinedAt: Date;
  lastActive: Date;
  discussionsCount: number;
  repliesCount: number;
  points: number;
  level: number;
}

interface AdminDiscussion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  topic: {
    id: string;
    name: string;
  };
  isModerated: boolean;
  isFlagged: boolean;
  createdAt: Date;
  repliesCount: number;
  votesCount: number;
  viewsCount: number;
}

interface AdminReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  discussion: {
    id: string;
    title: string;
  };
  isModerated: boolean;
  isFlagged: boolean;
  createdAt: Date;
  votesCount: number;
}

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalDiscussions: number;
    totalReplies: number;
    flaggedContent: number;
    bannedUsers: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
}

interface UserManagementProps {
  users: AdminUser[];
  onUserAction: (userId: string, action: string) => void;
}

interface ContentModerationProps {
  discussions: AdminDiscussion[];
  replies: AdminReply[];
  /** Optional: a server component cannot pass a function here (the moderation page does not). */
  onContentAction?: (contentId: string, type: "discussion" | "reply", action: string) => void;
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
    { title: "Discussions", value: stats.totalDiscussions, icon: MessageSquare, color: "text-green-600" },
    { title: "Replies", value: stats.totalReplies, icon: MessageSquare, color: "text-purple-600" },
    { title: "Flagged Content", value: stats.flaggedContent, icon: Flag, color: "text-red-600" },
    { title: "Banned Users", value: stats.bannedUsers, icon: Shield, color: "text-orange-600" },
    { title: "Daily Active", value: stats.dailyActiveUsers, icon: TrendingUp, color: "text-emerald-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value.toLocaleString("fr-FR")}</p>
                </div>
                <IconComponent className={cn("h-8 w-8", stat.color)} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function UserManagement({ users, onUserAction }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.isActive && !user.isBanned) ||
                         (statusFilter === "banned" && user.isBanned) ||
                         (statusFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("role", newRole);

      const result = await updateUserRole(formData);
      
      if (result.success) {
        toast.success("User role updated successfully");
        onUserAction(userId, "role_updated");
      } else {
        toast.error(result.error || "Failed to update user role");
      }
    } catch {
      toast.error("An error occurred while updating user role");
    }
  };

  const handleBanUser = async (userId: string, shouldBan: boolean) => {
    try {
      const formData = new FormData();
      formData.append("userId", userId);

      const result = shouldBan ? await banUser(formData) : await unbanUser(formData);
      
      if (result.success) {
        toast.success(shouldBan ? "User banned successfully" : "User unbanned successfully");
        onUserAction(userId, shouldBan ? "banned" : "unbanned");
      } else {
        toast.error(result.error || `Failed to ${shouldBan ? "ban" : "unban"} user`);
      }
    } catch {
      toast.error(`An error occurred while ${shouldBan ? "banning" : "unbanning"} user`);
    }
  };

  const getRoleBadge = (role: AdminUser["role"]) => {
    const variants = {
      USER: { variant: "outline" as const, text: "User" },
      MENTOR: { variant: "secondary" as const, text: "Mentor" },
      MODERATOR: { variant: "default" as const, text: "Moderator" },
      ADMIN: { variant: "destructive" as const, text: "Admin" },
    };

    return <Badge variant={variants[role].variant}>{variants[role].text}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32" aria-label="Role">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="MENTOR">Mentor</SelectItem>
              <SelectItem value="MODERATOR">Moderator</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32" aria-label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    className="p-0 h-auto"
                  >
                    {expandedUser === user.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      {getRoleBadge(user.role)}
                      {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                      {!user.isActive && <Badge variant="outline">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-32" aria-label={`Rôle de ${user.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="MENTOR">Mentor</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={user.isBanned ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => handleBanUser(user.id, !user.isBanned)}
                  >
                    {user.isBanned ? "Unban" : "Ban"}
                  </Button>
                </div>
              </div>

              {expandedUser === user.id && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Joined</p>
                    <p className="text-muted-foreground">
                      {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Last Active</p>
                    <p className="text-muted-foreground">
                      {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Discussions</p>
                    <p className="text-muted-foreground">{user.discussionsCount}</p>
                  </div>
                  <div>
                    <p className="font-medium">Replies</p>
                    <p className="text-muted-foreground">{user.repliesCount}</p>
                  </div>
                  <div>
                    <p className="font-medium">Points</p>
                    <p className="text-muted-foreground">{user.points}</p>
                  </div>
                  <div>
                    <p className="font-medium">Level</p>
                    <p className="text-muted-foreground">{user.level}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ContentModeration({ discussions, replies, onContentAction }: ContentModerationProps) {
  const [activeTab, setActiveTab] = useState("discussions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "flagged" && discussion.isFlagged) ||
                         (statusFilter === "moderated" && discussion.isModerated);
    
    return matchesSearch && matchesStatus;
  });

  const filteredReplies = replies.filter(reply => {
    const matchesSearch = reply.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "flagged" && reply.isFlagged) ||
                         (statusFilter === "moderated" && reply.isModerated);
    
    return matchesSearch && matchesStatus;
  });

  const handleContentAction = async (contentId: string, type: "discussion" | "reply", action: string) => {
    try {
      let result;
      const formData = new FormData();
      formData.append(type === "discussion" ? "discussionId" : "replyId", contentId);

      switch (action) {
        case "moderate":
          formData.append("action", "moderate");
          result = await moderateContent(formData);
          break;
        case "delete":
          result = type === "discussion" 
            ? await deleteDiscussion(contentId)
            : await deleteReply(contentId);
          break;
        case "unmoderate":
          formData.append("action", "unmoderate");
          result = await moderateContent(formData);
          break;
        default:
          return;
      }

      if (result.success) {
        toast.success(`Content ${action}d successfully`);
        onContentAction?.(contentId, type, action);
      } else {
        toast.error(result.error || `Failed to ${action} content`);
      }
    } catch {
      toast.error(`An error occurred while ${action}ing content`);
    }
  };

  const ContentItem = ({ 
    item, 
    type 
  }: { 
    item: AdminDiscussion | AdminReply, 
    type: "discussion" | "reply" 
  }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.author.avatar} alt={item.author.name} />
              <AvatarFallback className="text-xs">
                {item.author.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{item.author.name}</span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
            {item.isFlagged && <Badge variant="destructive">Flagged</Badge>}
            {item.isModerated && <Badge variant="secondary">Moderated</Badge>}
          </div>

          {type === "discussion" && "title" in item && (
            <h3 className="font-semibold mb-2">{item.title}</h3>
          )}

          {type === "reply" && "discussion" in item && (
            <p className="text-sm text-muted-foreground mb-2">
              Reply to: {item.discussion.title}
            </p>
          )}

          <p className="text-sm text-muted-foreground line-clamp-3">
            {item.content}
          </p>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{item.votesCount} votes</span>
            {type === "discussion" && "repliesCount" in item && (
              <span>{item.repliesCount} replies</span>
            )}
            {type === "discussion" && "viewsCount" in item && (
              <span>{item.viewsCount} views</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleContentAction(item.id, type, item.isModerated ? "unmoderate" : "moderate")}
            aria-label={item.isModerated ? "Rendre ce contenu visible" : "Masquer ce contenu"}
          >
            {item.isModerated ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleContentAction(item.id, type, "delete")}
            aria-label="Supprimer ce contenu"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Content Moderation
        </CardTitle>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32" aria-label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="moderated">Moderated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discussions">
              Discussions ({filteredDiscussions.length})
            </TabsTrigger>
            <TabsTrigger value="replies">
              Replies ({filteredReplies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-4 mt-4">
            {filteredDiscussions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No discussions found matching your criteria.
              </div>
            ) : (
              filteredDiscussions.map((discussion) => (
                <ContentItem 
                  key={discussion.id} 
                  item={discussion} 
                  type="discussion" 
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="replies" className="space-y-4 mt-4">
            {filteredReplies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No replies found matching your criteria.
              </div>
            ) : (
              filteredReplies.map((reply) => (
                <ContentItem 
                  key={reply.id} 
                  item={reply} 
                  type="reply" 
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}