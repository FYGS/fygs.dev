"use client";

import { useState } from "react";
import { Star, Send, Check, X, Clock, Award } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMentorRequest, respondToMentorRequest } from "@/app/actions/community-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MentorProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  expertise: string[];
  rating: number;
  totalSessions: number;
  isAvailable: boolean;
  responseTime: string;
  languages: string[];
  timezone: string;
}

interface MentorshipRequest {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  message: string;
  topic: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Date;
  updatedAt: Date;
  mentor: MentorProfile;
  student: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface MentorCardProps {
  mentor: MentorProfile;
  onRequestMentorship?: (mentorId: string) => void;
}

interface MentorshipRequestsProps {
  requests: MentorshipRequest[];
  userRole: "MENTOR" | "STUDENT";
}

export function MentorCard({ mentor, onRequestMentorship }: MentorCardProps) {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("");
  const [urgency, setUrgency] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestMentorship = async () => {
    if (!message.trim() || !topic.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("mentorId", mentor.id);
      formData.append("message", message);
      formData.append("topic", topic);
      formData.append("urgency", urgency);

      const result = await createMentorRequest(formData);

      if (result.success) {
        toast.success("Mentorship request sent successfully!");
        setRequestDialogOpen(false);
        setMessage("");
        setTopic("");
        setUrgency("MEDIUM");
        onRequestMentorship?.(mentor.id);
      } else {
        toast.error(result.error || "Failed to send mentorship request");
      }
    } catch {
      toast.error("An error occurred while sending the request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? "bg-green-500" : "bg-gray-400";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback className="text-sm">
                {mentor.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div 
              className={cn(
                "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white",
                getStatusColor(mentor.isAvailable)
              )}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate">{mentor.name}</h3>
              {mentor.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {mentor.totalSessions} sessions • {mentor.responseTime} response time
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {mentor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {mentor.bio}
          </p>
        )}

        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium mb-1">Expertise</h4>
            <div className="flex flex-wrap gap-1">
              {mentor.expertise.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {mentor.expertise.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mentor.expertise.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{mentor.timezone}</span>
            <span>{mentor.languages.join(", ")}</span>
          </div>
        </div>

        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              disabled={!mentor.isAvailable}
            >
              {mentor.isAvailable ? "Request Mentorship" : "Unavailable"}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Mentorship from {mentor.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Topic</label>
                <Textarea
                  placeholder="What do you need help with?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Describe your request in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Urgency</label>
                <Select value={urgency} onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") => setUrgency(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - Within a week</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Within 2-3 days</SelectItem>
                    <SelectItem value="HIGH">High - ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setRequestDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRequestMentorship}
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export function MentorshipRequests({ requests, userRole }: MentorshipRequestsProps) {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const handleResponse = async (requestId: string, action: "ACCEPT" | "REJECT") => {
    setRespondingTo(requestId);
    
    try {
      const normalizedAction = action === "ACCEPT" ? "accept" : "decline";
      const result = await respondToMentorRequest(requestId, normalizedAction);

      if (result.success) {
        toast.success(
          action === "ACCEPT" 
            ? "Mentorship request accepted!" 
            : "Mentorship request declined"
        );
      } else {
        toast.error(result.error || "Failed to respond to request");
      }
    } catch {
      toast.error("An error occurred while responding to the request");
    } finally {
      setRespondingTo(null);
    }
  };

  const getStatusBadge = (status: MentorshipRequest["status"]) => {
    const variants = {
      PENDING: { variant: "secondary" as const, text: "Pending", icon: Clock },
      ACCEPTED: { variant: "default" as const, text: "Accepted", icon: Check },
      REJECTED: { variant: "destructive" as const, text: "Rejected", icon: X },
      COMPLETED: { variant: "outline" as const, text: "Completed", icon: Award },
    };

    const config = variants[status];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: MentorshipRequest["urgency"]) => {
    const variants = {
      LOW: { variant: "outline" as const, text: "Low Priority" },
      MEDIUM: { variant: "secondary" as const, text: "Medium Priority" },
      HIGH: { variant: "destructive" as const, text: "High Priority" },
    };

    const config = variants[urgency];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No mentorship requests</h3>
          <p className="text-muted-foreground">
            {userRole === "MENTOR" 
              ? "You haven't received any mentorship requests yet."
              : "You haven't sent any mentorship requests yet."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={userRole === "MENTOR" ? request.student.avatar : request.mentor.avatar} 
                      alt={userRole === "MENTOR" ? request.student.name : request.mentor.name}
                    />
                    <AvatarFallback>
                      {(userRole === "MENTOR" ? request.student.name : request.mentor.name)
                        .split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">
                      {userRole === "MENTOR" 
                        ? `Request from ${request.student.name}`
                        : `Request to ${request.mentor.name}`
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Topic: {request.topic}</h4>
                  <p className="text-sm text-muted-foreground">{request.message}</p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(request.status)}
                  {getUrgencyBadge(request.urgency)}
                </div>
              </div>

              {userRole === "MENTOR" && request.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse(request.id, "REJECT")}
                    disabled={respondingTo === request.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResponse(request.id, "ACCEPT")}
                    disabled={respondingTo === request.id}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}