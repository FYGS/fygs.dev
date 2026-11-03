"use client";

import { Award, Crown, Shield, Star, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CommunityUser } from "@/types/community";

/** What the badge strip reads of a member: level, points and (optionally) badges. Never a whole user row. */
export type BadgeBearer = Pick<CommunityUser, "communityLevel"> & Partial<Pick<CommunityUser, "communityPoints" | "userBadges">>;

interface UserBadgeProps {
  user: BadgeBearer;
  showLevel?: boolean;
  showPoints?: boolean;
  showBadges?: boolean;
  maxBadges?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const levelConfig = {
  1: { name: "Newcomer", icon: Star, color: "text-gray-600" },
  2: { name: "Member", icon: Star, color: "text-blue-600" },
  3: { name: "Active", icon: Award, color: "text-green-600" },
  4: { name: "Expert", icon: Shield, color: "text-purple-600" },
  5: { name: "Master", icon: Crown, color: "text-yellow-600" },
};

const badgeIcons: Record<string, typeof Award> = {
  FIRST_POST: Star,
  HELPFUL: Award,
  EXPERT: Shield,
  MENTOR: Crown,
  TOP_CONTRIBUTOR: Zap,
};

const getBadgeColor = (type: string) => {
  switch (type) {
    case "FIRST_POST":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "HELPFUL":
      return "bg-green-100 text-green-800 border-green-200";
    case "EXPERT":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "MENTOR":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "TOP_CONTRIBUTOR":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function UserBadges({
  user,
  showLevel = true,
  showPoints = false,
  showBadges = true,
  maxBadges = 3,
  size = "md",
  className,
}: UserBadgeProps) {
  const level = user.communityLevel || 1;
  const points = user.communityPoints || 0;
  const badges = user.userBadges || [];
  
  const levelInfo = levelConfig[level as keyof typeof levelConfig] || levelConfig[1];
  const LevelIcon = levelInfo.icon;
  
  const visibleBadges = badges.slice(0, maxBadges);
  const hiddenBadgesCount = Math.max(0, badges.length - maxBadges);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1 flex-wrap", className)}>
        {/* User Level Badge */}
        {showLevel && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={cn(
                  "border-dashed",
                  levelInfo.color,
                  sizeClasses[size]
                )}
              >
                <LevelIcon className={cn("mr-1", iconSizes[size])} />
                L{level}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-medium text-black">{levelInfo.name}</div>
                <div className="text-xs text-gray-500">Level {level}</div>
                {showPoints && (
                  <div className="text-xs text-gray-500">{points} points</div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Community Points */}
        {showPoints && !showLevel && (
          <Badge variant="secondary" className={sizeClasses[size]}>
            <Zap className={cn("mr-1", iconSizes[size])} />
            {points}
          </Badge>
        )}

        {/* Achievement Badges */}
        {showBadges && visibleBadges.map((userBadge) => {
          const BadgeIcon = badgeIcons[userBadge.badge.type] ?? Award;
          const badgeColorClass = getBadgeColor(userBadge.badge.type);
          
          return (
            <Tooltip key={userBadge.id}>
              <TooltipTrigger asChild>
                <Badge
                  className={cn(
                    "border",
                    badgeColorClass,
                    sizeClasses[size]
                  )}
                >
                  <BadgeIcon className={cn("mr-1", iconSizes[size])} />
                  {userBadge.badge.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium text-black">{userBadge.badge.name}</div>
                  <div className="text-xs text-gray-500">
                    {userBadge.badge.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Earned: {new Date(userBadge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Hidden badges indicator */}
        {hiddenBadgesCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn("text-muted-foreground", sizeClasses[size])}>
                +{hiddenBadgesCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs text-black">
                {hiddenBadgesCount} more badge{hiddenBadgesCount !== 1 ? 's' : ''}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Individual Badge Component
interface BadgeDisplayProps {
  badge: {
    name: string;
    description: string;
    type: string;
  };
  earnedAt?: Date;
  size?: "sm" | "md" | "lg";
}

export function BadgeDisplay({ badge, earnedAt, size = "md" }: BadgeDisplayProps) {
  const BadgeIcon = badgeIcons[badge.type] ?? Award;
  const badgeColorClass = getBadgeColor(badge.type);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={cn(
              "border cursor-help",
              badgeColorClass,
              sizeClasses[size]
            )}
          >
            <BadgeIcon className={cn("mr-1", iconSizes[size])} />
            {badge.name}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-medium text-black">{badge.name}</div>
            <div className="text-xs text-gray-500">
              {badge.description}
            </div>
            {earnedAt && (
              <div className="text-xs text-gray-500 mt-1">
                Earned: {earnedAt.toLocaleDateString()}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}