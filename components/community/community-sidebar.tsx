"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MessageCircle, 
  TrendingUp, 
  Bookmark, 
  Users, 
  Tag,
  Crown,
  Bell,
  Search,
  Plus,
  ChevronRight,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { NotificationsDropdown } from "./notifications-dropdown";
import { FollowTopicButton } from "./follow-topic-button";
import { cn } from "@/lib/utils";
import { CommunityTopic } from "@/types/community";

interface CommunitySidebarProps {
  topics: CommunityTopic[];
  followedTopics?: string[];
  unreadNotifications?: number;
  userId?: string;
  className?: string;
}

const navigationItems = [
  {
    label: "All Discussions",
    href: "/community",
    icon: MessageCircle,
    exact: true,
  },
  {
    label: "Trending",
    href: "/community/trending",
    icon: TrendingUp,
  },
  {
    label: "My Bookmarks",
    href: "/community/bookmarks",
    icon: Bookmark,
  },
  {
    label: "Following",
    href: "/community/following",
    icon: Users,
  },
  {
    label: "Mentorship",
    href: "/community/mentorship",
    icon: Crown,
  },
];

export function CommunitySidebar({
  topics,
  followedTopics = [],
  unreadNotifications = 0,
  userId,
  className,
}: CommunitySidebarProps) {
  const pathname = usePathname();
  const [topicSearch, setTopicSearch] = useState("");
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(true);

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const followedTopicsList = topics.filter((topic) =>
    followedTopics.includes(topic.id)
  );

  const popularTopics = topics
    .sort((a, b) => (b._count?.discussions || 0) - (a._count?.discussions || 0))
    .slice(0, 5);

  const isActivePath = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn("w-64 shrink-0", className)}>
      <div className="space-y-4">
        {/* Create Discussion Button */}
        <Button asChild className="w-full">
          <Link href="/community/new">
            <Plus className="h-4 w-4 mr-2" />
            New Discussion
          </Link>
        </Button>

        {/* Navigation */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Navigation</CardTitle>
              {userId && (
                <NotificationsDropdown 
                  initialCount={unreadNotifications}
                  userId={userId}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1 p-2">
              {navigationItems.map((item) => {
                const isActive = isActivePath(item.href, item.exact);
                const Icon = item.icon;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.label === "My Bookmarks" && unreadNotifications > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Followed Topics */}
        {followedTopicsList.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Following
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {followedTopicsList.slice(0, 8).map((topic) => (
                  <Link key={topic.id} href={`/community/topics/${topic.slug}`}>
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm">
                      {topic.icon && (
                        <span className="text-base">{topic.icon}</span>
                      )}
                      <span className="flex-1 truncate">{topic.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {topic._count?.discussions || 0}
                      </span>
                    </div>
                  </Link>
                ))}
                
                {followedTopicsList.length > 8 && (
                  <Link href="/community/topics">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm text-muted-foreground">
                      <span className="flex-1">View all topics</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Topics */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Topics
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
                className="h-6 w-6 p-0"
              >
                {isTopicsExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardHeader>
          
          {isTopicsExpanded && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search topics..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>

                {/* Popular Topics */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Popular
                  </div>
                  <ScrollArea className="max-h-32">
                    <div className="space-y-1">
                      {popularTopics.map((topic) => (
                        <Link key={topic.id} href={`/community/topics/${topic.slug}`}>
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm">
                            {topic.icon && (
                              <span className="text-base">{topic.icon}</span>
                            )}
                            <span className="flex-1 truncate">{topic.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {topic._count?.discussions || 0}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                {/* All Topics */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    All Topics ({filteredTopics.length})
                  </div>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-1 pr-2">
                      {filteredTopics.map((topic) => {
                        const isFollowing = followedTopics.includes(topic.id);
                        
                        return (
                          <div key={topic.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm">
                            <Link href={`/community/topics/${topic.slug}`} className="flex-1 flex items-center gap-2 min-w-0">
                              {topic.icon && (
                                <span className="text-base">{topic.icon}</span>
                              )}
                              <span className="flex-1 truncate">{topic.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {topic._count?.discussions || 0}
                              </span>
                            </Link>
                            <FollowTopicButton
                              topicId={topic.id}
                              topicName={topic.name}
                              isFollowing={isFollowing}
                              variant="icon"
                            />
                          </div>
                        );
                      })}
                      
                      {filteredTopics.length === 0 && topicSearch && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          No topics found
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/community/topics">
                    View All Topics
                  </Link>
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-4">
            <Link href="/community/notifications">
              <div className="flex items-center gap-3 hover:bg-accent rounded-md p-2 -m-2 transition-colors">
                <div className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs flex items-center justify-center"
                    >
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-medium">Notifications</span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}