"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  MessageCircle,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Copy,
  PhoneOff,
  Code,
  Monitor,
  Zap,
  Target,
  GraduationCap,
} from "lucide-react";
import { useEditorStore } from "../_stores/editor-store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  cursorPosition?: { line: number; column: number };
  role: "host" | "collaborator";
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

export function CollaborativeCoding() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<Participant>({
    id: "current-user",
    name: "You",
    isOnline: true,
    isAudioMuted: false,
    isVideoMuted: true,
    role: "host",
  });
  
  const { code } = useEditorStore();
  const [codeShared, setCodeShared] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock participants data
  const mockParticipants: Participant[] = [
    {
      id: "1",
      name: "Alex Johnson",
      isOnline: true,
      isAudioMuted: false,
      isVideoMuted: false,
      role: "host",
    },
    {
      id: "2",
      name: "Sam Chen",
      isOnline: true,
      isAudioMuted: true,
      isVideoMuted: false,
      role: "collaborator",
    },
    {
      id: "3",
      name: "Taylor Smith",
      isOnline: false,
      isAudioMuted: true,
      isVideoMuted: true,
      role: "collaborator",
    },
  ];

  // Mock chat messages
  const mockMessages: ChatMessage[] = [
    {
      id: "1",
      userId: "1",
      userName: "Alex Johnson",
      content: "Hey everyone, ready to tackle the system design challenge?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      userId: "2",
      userName: "Sam Chen",
      content: "Yes! I've been preparing for this one all week",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
    },
    {
      id: "3",
      userId: "system",
      userName: "System",
      content: "Taylor Smith joined the session",
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      isSystem: true,
    },
  ];

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Simulate joining a session
  const joinSession = (id: string) => {
    setIsSessionActive(true);
    setSessionId(id);
    setParticipants([currentUser, ...mockParticipants]);
    setChatMessages(mockMessages);
  };

  // Simulate creating a new session
  const createSession = () => {
    if (!sessionName.trim()) {
      alert("Please enter a session name");
      return;
    }

    const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setIsSessionActive(true);
    setSessionId(newSessionId);
    setParticipants([currentUser]);
    setChatMessages([
      {
        id: "1",
        userId: "system",
        userName: "System",
        content: "You created a new collaborative session",
        timestamp: new Date(),
        isSystem: true,
      }
    ]);
  };

  // Simulate leaving a session
  const leaveSession = () => {
    setIsSessionActive(false);
    setSessionId(null);
    setParticipants([]);
    setChatMessages([]);
  };

  // Toggle audio mute
  const toggleAudio = () => {
    setCurrentUser(prev => ({
      ...prev,
      isAudioMuted: !prev.isAudioMuted
    }));
  };

  // Toggle video mute
  const toggleVideo = () => {
    setCurrentUser(prev => ({
      ...prev,
      isVideoMuted: !prev.isVideoMuted
    }));
  };

  // Share code with collaborators
  const shareCode = () => {
    // In a real implementation, this would sync code with other participants
    setCodeShared(true);
    
    // Add system message
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      userId: "system",
      userName: "System",
      content: "Code shared with collaborators",
      timestamp: new Date(),
      isSystem: true,
    };
    
    setChatMessages(prev => [...prev, message]);
    
    // Show success toast
    setTimeout(() => {
      setCodeShared(false);
    }, 3000);
  };

  // Send chat message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate a response from another participant after a delay
    setTimeout(() => {
      const responses = [
        "That's a good approach!",
        "I was thinking the same thing",
        "How about trying this alternative?",
        "Let me check that for you",
        "Great idea, let's implement it",
        "I have a different perspective on this"
      ];
      
      const response: ChatMessage = {
        id: crypto.randomUUID(),
        userId: "2",
        userName: "Sam Chen",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, response]);
    }, 2000);
  };

  // Copy session link
  const copySessionLink = () => {
    if (!sessionId) return;
    
    const link = `${window.location.origin}/tech-mastry/playground?session=${sessionId}`;
    navigator.clipboard.writeText(link);
    
    // Show copied notification
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      userId: "system",
      userName: "System",
      content: "Session link copied to clipboard",
      timestamp: new Date(),
      isSystem: true,
    };
    
    setChatMessages(prev => [...prev, message]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Collaborative Coding</h1>
        <p className="text-muted-foreground mt-2">
          Code together in real-time with your peers, practice pair programming, and prepare for technical interviews collaboratively
        </p>
      </div>

      {!isSessionActive ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Start a Collaborative Session</span>
              </CardTitle>
              <CardDescription>
                Create or join a coding session to work together on challenges and problems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    placeholder="Enter a name for your coding session"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={createSession}
                    className="flex items-center gap-2"
                    disabled={!sessionName.trim()}
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Session
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const id = prompt("Enter session ID:");
                      if (id) joinSession(id);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Join Session
                  </Button>
                </div>
              
                <Separator />
              
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    How Collaborative Coding Works
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="h-4 w-4 text-primary" />
                        <span className="font-medium">Real-time Editing</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Multiple users can edit the same code simultaneously with live cursor tracking
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium">Integrated Chat</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Discuss code changes and solutions without leaving the editor
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="font-medium">Performance Tracking</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Track your progress and compare solutions with your peers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Participants Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="backdrop-blur-xl bg-background/80 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Participants</span>
                  <Badge variant="outline" className="ml-auto">
                    {participants.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {participants.map((participant) => (
                    <div 
                      key={participant.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback>
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{participant.name}</p>
                          {participant.role === "host" && (
                            <Badge variant="secondary" className="text-[10px]">
                              Host
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`h-2 w-2 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          <span className="text-xs text-muted-foreground">
                            {participant.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {participant.isAudioMuted ? (
                          <MicOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Mic className="h-4 w-4 text-green-500" />
                        )}
                        
                        {participant.isVideoMuted ? (
                          <VideoOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Video className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Share Session</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input 
                        value={sessionId ? `${window.location.origin}/tech-mastry/playground?session=${sessionId}` : ''}
                        readOnly
                        className="text-xs"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={copySessionLink}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this link with others to invite them to the session
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-xl bg-background/80 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span>Session Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={shareCode}
                  >
                    <Code className="h-4 w-4" />
                    Share My Code
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={toggleAudio}
                  >
                    {currentUser.isAudioMuted ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {currentUser.isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={toggleVideo}
                  >
                    {currentUser.isVideoMuted ? (
                      <VideoOff className="h-4 w-4" />
                    ) : (
                      <Video className="h-4 w-4" />
                    )}
                    {currentUser.isVideoMuted ? 'Start Video' : 'Stop Video'}
                  </Button>
                  
                  <Separator />
                  
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center gap-2 mt-2"
                    onClick={leaveSession}
                  >
                    <PhoneOff className="h-4 w-4" />
                    End Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Coding Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="backdrop-blur-xl bg-background/80 border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      <span>Collaborative Editor</span>
                    </CardTitle>
                    <CardDescription>
                      Working on: {sessionName || "Untitled Session"}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {codeShared && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs border border-green-500/20"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Code Shared</span>
                      </motion.div>
                    )}
                    
                    <Badge variant="outline" className="text-xs">
                      {participants.filter(p => p.isOnline).length} online
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-background/50">
                  <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Live Session</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Everyone can edit</span>
                  </div>
                  
                  {/* Editor placeholder - in a real implementation this would be integrated with Monaco */}
                  <div className="p-4 min-h-[400px] font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
                      {code || `// Welcome to the collaborative coding session!\n// Invite others using the session ID: ${sessionId || 'N/A'}\n\n// Start coding together...\nfunction collaborativeSolution() {\n  // Your code here\n}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Chat Panel */}
            <Card className="backdrop-blur-xl bg-background/80 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span>Session Chat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col h-[300px]">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-3 ${message.userId === currentUser.id ? 'justify-end' : ''}`}
                      >
                        {message.userId !== currentUser.id && !message.isSystem && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={participants.find(p => p.id === message.userId)?.avatar} />
                            <AvatarFallback>
                              {message.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[80%] ${message.userId === currentUser.id ? 'ml-auto' : ''}`}>
                          {!message.isSystem && (
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium text-sm">
                                {message.userName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                          
                          <div
                            className={`mt-1 p-3 rounded-lg ${
                              message.isSystem
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 text-center'
                                : message.userId === currentUser.id
                                ? 'bg-primary/10 border border-primary/20 rounded-br-none'
                                : 'bg-muted/50 border border-border/50 rounded-bl-none'
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                        
                        {message.userId === currentUser.id && !message.isSystem && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>
                              {currentUser.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="sm">
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}