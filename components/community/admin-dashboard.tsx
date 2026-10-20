"use client";

import { useState } from "react";
import { Trash2, Eye, EyeOff, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  moderateContent,
  deleteDiscussion,
  deleteReply,
} from "@/app/actions/community-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

interface ContentModerationProps {
  discussions: AdminDiscussion[];
  replies: AdminReply[];
  /** Optional: a server component cannot pass a function here (the moderation page does not). */
  onContentAction?: (contentId: string, type: "discussion" | "reply", action: string) => void;
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