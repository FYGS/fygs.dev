"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, Copy, Mail, MessageCircle, Send } from "lucide-react";
import { Facebook, Linkedin, Twitter } from "@/components/icons/brand-icons";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  compact?: boolean;
}

export function ShareButtons({
  url,
  title,
  compact = false,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`,
    },
  ];

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex items-center flex-wrap gap-1.5",
        compact ? "gap-1" : "gap-2",
      )}
    >
      {shareLinks.map((link) => (
        <Tooltip key={link.name}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "transition-all hover:scale-105 shrink-0",
                compact && "h-8 w-8",
              )}
              aria-label={link.name}
              onClick={() =>
                window.open(link.href, "_blank", "noopener,noreferrer")
              }
            >
              <link.icon className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{link.name}</TooltipContent>
        </Tooltip>
      ))}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "transition-all hover:scale-105 shrink-0",
              copied && "border-emerald-500/50 text-emerald-500",
              compact && "h-8 w-8",
            )}
            aria-label={copied ? "Copied!" : "Copy link"}
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
            ) : (
              <Copy className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy link"}</TooltipContent>
      </Tooltip>
    </div>
  );
}
