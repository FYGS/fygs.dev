"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit2, Trash2, Lock, Unlock, Pin, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReplyEditor } from "./reply-editor";
import { deleteDiscussion, updateDiscussion } from "@/app/actions/community-actions";

interface DiscussionActionsProps {
  discussionId: string;
  content: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isSolved?: boolean;
  isAuthor: boolean;
  isModerator?: boolean;
}

export function DiscussionActions({
  discussionId,
  content,
  isPinned = false,
  isLocked = false,
  isSolved = false,
  isAuthor,
  isModerator = false,
}: DiscussionActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteDiscussion(discussionId);
      if (result.success) {
        toast.success("Discussion deleted successfully");
        router.push("/community");
      } else {
        toast.error(result.error || "Failed to delete discussion");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleUpdate = async (newContent: string) => {
    try {
      const formData = new FormData();
      formData.append("content", newContent);

      const result = await updateDiscussion(discussionId, formData);
      if (result.success) {
        toast.success("Discussion updated successfully");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Failed to update discussion");
      }
    } catch {
      toast.error("An error occurred while updating");
    }
  };

  const handleToggleSolved = async () => {
    try {
      const formData = new FormData();
      formData.append("isSolved", (!isSolved).toString());

      const result = await updateDiscussion(discussionId, formData);
      if (result.success) {
        toast.success(isSolved ? "Marked as unsolved" : "Marked as solved");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleTogglePin = async () => {
    try {
      const formData = new FormData();
      formData.append("isPinned", (!isPinned).toString());

      const result = await updateDiscussion(discussionId, formData);
      if (result.success) {
        toast.success(isPinned ? "Unpinned discussion" : "Pinned discussion");
      } else {
        toast.error(result.error || "Failed to update pin status");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleToggleLock = async () => {
    try {
      const formData = new FormData();
      formData.append("isLocked", (!isLocked).toString());

      const result = await updateDiscussion(discussionId, formData);
      if (result.success) {
        toast.success(isLocked ? "Unlocked discussion" : "Locked discussion");
      } else {
        toast.error(result.error || "Failed to update lock status");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  if (isEditing) {
    return (
      <div className="mt-4">
        <ReplyEditor
          initialContent={content}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitLabel="Update Discussion"
          placeholder="Edit your discussion..."
        />
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAuthor && (
            <>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleSolved}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSolved ? "Mark as unsolved" : "Mark as solved"}
              </DropdownMenuItem>
            </>
          )}
          
          {isModerator && (
            <>
              {isAuthor && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={handleTogglePin}>
                <Pin className="h-4 w-4 mr-2" />
                {isPinned ? "Unpin" : "Pin"} discussion
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleLock}>
                {isLocked ? (
                  <Unlock className="h-4 w-4 mr-2" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {isLocked ? "Unlock" : "Lock"} discussion
              </DropdownMenuItem>
            </>
          )}
          
          {(isAuthor || isModerator) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this discussion and all its replies.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
