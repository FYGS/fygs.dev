"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "../_stores/editor-store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI coding assistant. I can help you with code suggestions, debugging, and optimization. What would you like help with today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { code, language } = useEditorStore();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: generateAIResponse(input, code, language),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Placeholder function - replace with actual AI integration
  const generateAIResponse = (
    query: string,
    code: string,
    language: string
  ) => {
    // This is a placeholder. In a real implementation, you would call an AI API
    if (query.toLowerCase().includes("optimize")) {
      return `Here are some optimization suggestions for your ${language} code:\n\n1. Consider using memoization for recursive functions\n2. Avoid unnecessary array copies\n3. Use appropriate data structures for your operations`;
    } else if (query.toLowerCase().includes("explain")) {
      return `Your code appears to be a ${language} implementation that:\n\n- Initializes variables\n- Contains a main function with logic\n- Has error handling\n\nIs there a specific part you'd like me to explain in more detail?`;
    } else if (query.toLowerCase().includes("debug")) {
      return `I've analyzed your code and found potential issues:\n\n1. Check line 5 for possible null reference\n2. Your loop condition might cause off-by-one errors\n3. Consider adding error handling for edge cases`;
    } else {
      return `I've analyzed your ${language} code. It looks like you're working on an algorithm implementation. Can you tell me more about what you're trying to achieve, or what specific help you need?`;
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <Card className="border border-border/50 shadow-xl backdrop-blur-xl bg-background/80">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription>Get help with your code</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[350px] px-4">
                  <div className="space-y-4 pt-1 pb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg p-3",
                          message.role === "user"
                            ? "ml-10 bg-muted/50"
                            : "mr-10 bg-primary/10"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border text-sm",
                            message.role === "user"
                              ? "bg-background"
                              : "bg-primary/10 border-primary/20 text-primary"
                          )}
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center justify-center py-4">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-primary"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-primary"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="pt-3 pb-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    placeholder="Ask for help or suggestions..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-background/50"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
