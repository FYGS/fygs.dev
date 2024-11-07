"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

interface NewsletterPreferencesProps {
  categories: string[];
  currentEmail?: string;
}

export function NewsletterPreferences({
  categories,
  currentEmail,
}: NewsletterPreferencesProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" />
          Newsletter Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Newsletter Preferences</DialogTitle>
          <DialogDescription>
            Customize your newsletter experience. Choose the topics you&apos;re
            interested in and update your email preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <NewsletterForm categories={categories} currentEmail={currentEmail} />
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              // Logique pour se désabonner
            }}
          >
            Unsubscribe
          </Button>
          <Button type="submit">Save preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
