"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Reply, 
  User,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReviewReply {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    avatar: string | null;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  };
  isInstructorReply?: boolean;
}

interface ReviewRepliesProps {
  reviewId: string;
  initialReplies?: ReviewReply[];
  canReply?: boolean;
  className?: string;
  onReplyAdded?: (reply: ReviewReply) => void;
}

export function ReviewReplies({
  reviewId,
  initialReplies = [],
  canReply = false,
  className,
  onReplyAdded
}: ReviewRepliesProps) {
  const [replies, setReplies] = useState<ReviewReply[]>(initialReplies);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(initialReplies.length > 0);

  const loadReplies = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`);
      const data = await response.json();

      if (response.ok) {
        setReplies(data.replies);
        setHasLoaded(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [reviewId, isLoading]);

  // Update replies when initialReplies changes (real-time updates)
  // (derived during render; the guard stops once replies caught up)
  if (initialReplies.length > replies.length) {
    setReplies(initialReplies);
    setHasLoaded(true);
    setIsExpanded(true);
  }

  const handleToggleExpanded = () => {
    if (!isExpanded && !hasLoaded) {
      loadReplies();
    }
    setIsExpanded(!isExpanded);
  };

  // Add new reply to the list - exposed for parent component integration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReplyAdded = (newReply: ReviewReply) => {
    setReplies(prev => [newReply, ...prev]);
    setIsExpanded(true);
    setHasLoaded(true);
    onReplyAdded?.(newReply);
  };

  const getAuthorInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "INSTRUCTOR":
        return "default";
      case "ADMIN":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "INSTRUCTOR":
        return <GraduationCap className="h-3 w-3" />;
      case "ADMIN":
        return <User className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "INSTRUCTOR":
        return "Instructeur";
      case "ADMIN":
        return "Admin";
      default:
        return "Étudiant";
    }
  };

  if (replies.length === 0 && !canReply) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toggle button */}
      {replies.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleExpanded}
          className="gap-2 p-0 h-auto text-muted-foreground hover:text-foreground"
          disabled={isLoading}
        >
          <MessageSquare className="h-4 w-4" />
          {replies.length} réponse{replies.length > 1 ? 's' : ''}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Replies list */}
      {isExpanded && (
        <div className="space-y-3 pl-6 border-l-2 border-muted">
          {isLoading && (
            <div className="text-sm text-muted-foreground">
              Chargement des réponses...
            </div>
          )}

          {replies.map((reply) => (
            <Card key={reply.id} className="shadow-sm">
              <CardContent className="p-4">
                {/* Reply header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={reply.author.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getAuthorInitials(reply.author.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {reply.author.name || "Utilisateur"}
                      </p>
                      
                      {reply.author.role !== "STUDENT" && (
                        <Badge 
                          variant={getRoleBadgeVariant(reply.author.role)}
                          className="gap-1 text-xs"
                        >
                          {getRoleIcon(reply.author.role)}
                          {getRoleLabel(reply.author.role)}
                        </Badge>
                      )}

                      {reply.isInstructorReply && (
                        <Badge variant="outline" className="text-xs">
                          <Reply className="h-3 w-3 mr-1" />
                          Réponse officielle
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {format(new Date(reply.createdAt), "d MMMM yyyy 'à' HH:mm", {
                        locale: fr
                      })}
                    </p>
                  </div>
                </div>

                {/* Reply content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {replies.length === 0 && hasLoaded && (
            <p className="text-sm text-muted-foreground italic">
              Aucune réponse pour le moment.
            </p>
          )}
        </div>
      )}
    </div>
  );
}