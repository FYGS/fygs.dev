"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";

interface TimelineItemProps {
  date: string;
  title: string;
  company?: string;
  institution?: string;
  location: string;
  type?: string;
  description: string | string[];
  achievements?: string[];
  technologies?: string[];
  current?: boolean;
  gpa?: string;
  context?: string;
  variant?: "experience" | "education";
}

export const TimelineItem = ({
  date,
  title,
  company,
  institution,
  location,
  type,
  description,
  achievements,
  technologies,
  current,
  gpa,
  context,
  variant = "experience",
}: TimelineItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const descriptions = Array.isArray(description) ? description : [description];

  return (
    <div className="relative pl-8 pb-8 group">
      <div className="absolute left-0 top-2 h-full w-px bg-border group-hover:bg-primary/50 transition-colors duration-300" />
      <div className="absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-primary bg-background transition-transform duration-300 group-hover:scale-110 group-hover:shadow-glow" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <time className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-primary">
              {date}
            </time>
            {current && (
              <Badge
                variant="outline"
                className="text-primary border-primary transition-all duration-300 hover:scale-105 hover:shadow-sm"
              >
                Current
              </Badge>
            )}
            {type && (
              <Badge
                variant="secondary"
                className="text-xs transition-all duration-300 hover:scale-105 hover:shadow-sm"
              >
                {type}
              </Badge>
            )}
          </div>
          {context && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowContext(!showContext)}
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {showContext ? "Hide context" : "Show context"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="transition-all duration-300 group-hover:translate-x-1">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <div className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
            {variant === "experience" ? company : institution}
          </div>
          <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
            {location}
          </div>
          {gpa && (
            <div className="text-sm text-primary font-medium mt-1 transition-all duration-300 group-hover:scale-105">
              GPA: {gpa}
            </div>
          )}
        </div>

        {/* Context Section */}
        {showContext && context && (
          <Card className="p-4 bg-muted/50 border-l-4 border-primary transition-all duration-300 hover:bg-muted/70 hover:shadow-md">
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {context}
            </p>
          </Card>
        )}

        {/* Description List */}

        <motion.div
          initial={false}
          animate={{
            height: isExpanded
              ? "auto"
              : descriptions.length > 2
              ? "5.5rem"
              : "auto",
          }}
          className="overflow-hidden"
        >
          <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm pl-4">
            {descriptions.map((desc, index) => (
              <li
                key={index}
                className="transition-all duration-300 hover:translate-x-1 hover:text-foreground"
              >
                {desc}
              </li>
            ))}
          </ul>
        </motion.div>

        {descriptions.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        )}

        {/* Achievements Section */}
        {achievements && achievements.length > 0 && (
          <div className="space-y-2 transition-all duration-300 hover:translate-x-1">
            <h4 className="text-sm font-semibold text-primary">
              Key Achievements
            </h4>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm pl-4">
              {achievements.map((achievement, index) => (
                <li
                  key={index}
                  className="transition-all duration-300 hover:translate-x-1 hover:text-foreground"
                >
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technologies */}
        {technologies && technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {technologies.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-xs transition-all duration-300 hover:scale-110 hover:shadow-sm hover:bg-primary/5"
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface TimelineProps {
  items: TimelineItemProps[];
  variant?: "experience" | "education";
}

export const Timeline = ({ items, variant = "experience" }: TimelineProps) => {
  return (
    <div className="relative">
      {items.map((item, index) => (
        <TimelineItem key={index} {...item} variant={variant} />
      ))}
    </div>
  );
};
