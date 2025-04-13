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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Copy,
  Link2,
  MessageCircle,
  Mic,
  MicOff,
  User,
  UserPlus,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { useState } from "react";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  cursorPosition?: { line: number; column: number };
}

export function CollaborationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");
  const [messages, setMessages] = useState<
    { id: string; sender: string; text: string; timestamp: Date }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  // Mock participants - in a real app, this would come from a WebSocket connection
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "You",
      isActive: true,
      isMuted: !isAudioEnabled,
      isVideoOn: isVideoEnabled,
      isScreenSharing: false,
    },
  ]);

  const createSession = () => {
    if (!userName.trim()) {
      toast({
        title: "Please enter your name",
        description: "A name is required to create a session",
        variant: "destructive",
      });
      return;
    }

    // Generate a random session ID
    const newSessionId = Math.random().toString(36).substring(2, 10);
    setSessionId(newSessionId);
    
    // Update your name in participants
    setParticipants((prev) => 
      prev.map(p => p.id === "1" ? { ...p, name: userName } : p)
    );

    toast({
      title: "Collaboration session created!",
      description: "Share the link with others to collaborate",
    });
  };

  const joinSession = (id: string) => {
    if (!userName.trim()) {
      toast({
        title: "Please enter your name",
        description: "A name is required to join a session",
        variant: "destructive",
      });
      return;
    }

    setSessionId(id);
    
    // Update your name in participants
    setParticipants((prev) => 
      prev.map(p => p.id === "1" ? { ...p, name: userName } : p)
    );

    toast({
      title: "Joined collaboration session!",
      description: "You are now connected with others",
    });
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    setParticipants((prev) =>
      prev.map((p) => (p.id === "1" ? { ...p, isMuted: isAudioEnabled } : p))
    );
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === "1" ? { ...p, isVideoOn: !isVideoEnabled } : p
      )
    );
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Math.random().toString(36).substring(2, 10),
      sender: "You",
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const copySessionLink = () => {
    if (!sessionId) return;

    const link = `${window.location.origin}/interview-prep/playground?session=${sessionId}`;
    navigator.clipboard.writeText(link);

    toast({
      title: "Link copied!",
      description: "Share this link to collaborate",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          <span>Collaborate</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Collaborative Coding
          </DialogTitle>
          <DialogDescription>
            Code together in real-time with voice, video, and chat.
          </DialogDescription>
        </DialogHeader>

        {!sessionId ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audio">Enable Audio</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="audio"
                    checked={isAudioEnabled}
                    onCheckedChange={setIsAudioEnabled}
                  />
                  <Label htmlFor="audio">
                    {isAudioEnabled ? "On" : "Off"}
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Enable Video</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="video"
                    checked={isVideoEnabled}
                    onCheckedChange={setIsVideoEnabled}
                  />
                  <Label htmlFor="video">
                    {isVideoEnabled ? "On" : "Off"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                onClick={createSession}
                className="w-full gap-2"
                disabled={!userName.trim()}
              >
                <UserPlus className="w-4 h-4" />
                Create Session
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  const id = prompt("Enter session ID");
                  if (id) joinSession(id);
                }}
                disabled={!userName.trim()}
              >
                <Users className="w-4 h-4" />
                Join Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 bg-muted/30 p-2 rounded-md">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium">Session: {sessionId}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={copySessionLink}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span className="text-xs">Copy Link</span>
              </Button>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="participants" className="flex gap-2 items-center">
                  <Users className="h-4 w-4" />
                  <span>Participants ({participants.length})</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex gap-2 items-center">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat ({messages.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="participants"
                className="flex-1 overflow-auto p-1 space-y-2"
              >
                {participants.map((participant) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        {participant.isActive && (
                          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {participant.name}
                          {participant.id === "1" && " (You)"}
                        </div>
                        {participant.cursorPosition && (
                          <div className="text-xs text-muted-foreground">
                            Line {participant.cursorPosition.line}, Column{" "}
                            {participant.cursorPosition.column}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.id === "1" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              !isAudioEnabled && "text-destructive"
                            )}
                            onClick={toggleAudio}
                          >
                            {isAudioEnabled ? (
                              <Mic className="h-4 w-4" />
                            ) : (
                              <MicOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              !isVideoEnabled && "text-muted-foreground"
                            )}
                            onClick={toggleVideo}
                          >
                            {isVideoEnabled ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <VideoOff className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div
                            className={cn(
                              "h-8 w-8 flex items-center justify-center",
                              participant.isMuted && "text-destructive"
                            )}
                          >
                            {participant.isMuted ? (
                              <MicOff className="h-4 w-4" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={cn(
                              "h-8 w-8 flex items-center justify-center",
                              !participant.isVideoOn && "text-muted-foreground"
                            )}
                          >
                            {participant.isVideoOn ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <VideoOff className="h-4 w-4" />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}

                {participants.length === 1 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No other participants yet</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-1">
                      Share the session link with others to collaborate in real-time
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2"
                      onClick={copySessionLink}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Session Link
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="chat"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-auto p-2 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No messages yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mt-1">
                        Start the conversation with your collaborators
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2 max-w-[80%] rounded-lg p-3",
                          message.sender === "You"
                            ? "ml-auto bg-primary/10"
                            : "bg-muted/50"
                        )}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">
                              {message.sender}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter className="pt-2">
          {sessionId && (
            <Button
              variant="outline"
              onClick={() => {
                setSessionId(null);
                setMessages([]);
                setActiveTab("participants");
              }}
            >
              Leave Session
            </Button>
          )}
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
