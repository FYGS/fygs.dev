"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReviewUpdates } from "@/contexts/review-updates-context";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Flag,
  AlertTriangle,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportReason } from "@/lib/generated/prisma/browser";

interface ReviewInteractionsProps {
  reviewId: string;
  initialVotes?: {
    helpful: number;
    unhelpful: number;
    userVote?: { helpful: boolean } | null;
  };
  canVote?: boolean;
  canReply?: boolean;
  canReport?: boolean;
  isInstructor?: boolean;
  onReplyAdded?: (reply: any) => void;
}

export function ReviewInteractions({
  reviewId,
  initialVotes = { helpful: 0, unhelpful: 0, userVote: null },
  canVote = false,
  canReply = false,
  canReport = false,
  isInstructor = false,
  onReplyAdded
}: ReviewInteractionsProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [isVoting, setIsVoting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | "">("");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Use context for updates
  const { addReply, updateVote } = useReviewUpdates();

  const handleVote = async (helpful: boolean) => {
    if (isVoting || !canVote) return;

    setIsVoting(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du vote');
      }

      // Update local state
      const newHelpfulCount = data.helpfulCount;
      const totalVotes = votes.helpful + votes.unhelpful;
      const newUnhelpfulCount = totalVotes - newHelpfulCount + (data.action === 'removed' ? 0 : 1);

      const newVoteState = {
        helpful: newHelpfulCount,
        unhelpful: Math.max(0, newUnhelpfulCount),
        userVote: data.action === 'removed' ? null : { helpful }
      };

      setVotes(newVoteState);

      // Update context
      updateVote(reviewId, {
        helpful: newHelpfulCount,
        userVote: newVoteState.userVote
      });

      if (data.action === 'created') {
        toast.success(helpful ? "Vote utile enregistré" : "Vote non utile enregistré");
      } else if (data.action === 'updated') {
        toast.success("Vote mis à jour");
      } else {
        toast.success("Vote retiré");
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: replyContent.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réponse');
      }

      // Reset form
      setReplyContent("");
      setShowReplyForm(false);

      // Update context
      addReply(reviewId, data.reply);

      // Notify legacy callback if exists
      if (onReplyAdded) {
        onReplyAdded(data.reply);
      }

      toast.success("Réponse publiée avec succès");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la réponse");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason || isReporting) return;

    setIsReporting(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason: reportReason,
          details: reportDetails.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du signalement');
      }

      // Reset form and close dialog
      setReportReason("");
      setReportDetails("");
      setShowReportDialog(false);

      toast.success("Avis signalé avec succès");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors du signalement");
    } finally {
      setIsReporting(false);
    }
  };

  const getReportReasonLabel = (reason: ReportReason) => {
    const labels: Record<ReportReason, string> = {
      SPAM: "Spam ou contenu publicitaire",
      INAPPROPRIATE: "Contenu inapproprié",
      FAKE: "Faux avis",
      OFFENSIVE: "Contenu offensant",
      COPYRIGHT: "Violation de droits d'auteur",
      OTHER: "Autre raison"
    };
    return labels[reason];
  };

  return (
    <div className="flex items-center gap-4 pt-4 border-t">
      {/* Voting buttons */}
      {canVote && (
        <div className="flex items-center gap-2">
          <Button
            variant={votes.userVote?.helpful === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote(true)}
            disabled={isVoting}
            className={cn(
              "gap-1.5",
              votes.userVote?.helpful === true && "bg-green-700 text-white hover:bg-green-800"
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{votes.helpful}</span>
          </Button>

          <Button
            variant={votes.userVote?.helpful === false ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote(false)}
            disabled={isVoting}
            className={cn(
              "gap-1.5",
              votes.userVote?.helpful === false && "bg-red-700 text-white hover:bg-red-800"
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>{votes.unhelpful}</span>
          </Button>
        </div>
      )}

      {/* Reply button */}
      {canReply && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="gap-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Répondre
        </Button>
      )}

      {/* Report button */}
      {canReport && (
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Flag className="h-3.5 w-3.5" />
              Signaler
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Signaler cet avis
              </DialogTitle>
              <DialogDescription>
                Veuillez sélectionner la raison du signalement. Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Raison du signalement *
                </label>
                <Select value={reportReason} onValueChange={(value) => setReportReason(value as ReportReason)}>
                  <SelectTrigger className="mt-1" aria-label="Sélectionnez une raison">
                    <SelectValue placeholder="Sélectionnez une raison" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ReportReason).map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {getReportReasonLabel(reason)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Détails supplémentaires (optionnel)
                </label>
                <Textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Expliquez la raison du signalement..."
                  className="mt-1"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {reportDetails.length}/500 caractères
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowReportDialog(false)}
                  disabled={isReporting}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReport}
                  disabled={!reportReason || isReporting}
                >
                  {isReporting ? "Signalement..." : "Signaler"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Instructor badge */}
      {isInstructor && (
        <Badge variant="secondary" className="ml-auto">
          Instructeur
        </Badge>
      )}

      {/* Reply form */}
      {showReplyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-lg">
            <h3 className="font-semibold mb-4">Répondre à cet avis</h3>
            
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Écrivez votre réponse..."
              rows={4}
              maxLength={1000}
            />
            
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {replyContent.length}/1000 caractères
            </p>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
                disabled={isSubmittingReply}
              >
                Annuler
              </Button>
              <Button
                onClick={handleReply}
                disabled={!replyContent.trim() || isSubmittingReply}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmittingReply ? "Publication..." : "Publier"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}