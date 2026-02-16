"use client";
import { Badge } from "@/components/ui/badge";
import { Section } from "./Section";
import { AWSDynamoIcon } from "./icons/AWSDynamoIcon";
import { AWSLambdaIcon } from "./icons/AWSLambdaIcon";
import { NestJSIcon } from "./icons/NestJSIcon";
import { NextJSIcon } from "./icons/NextJSIcon";
import { NodeJSIcon } from "./icons/NodeJSIcon";
import { OpenAIIcon } from "./icons/OpenAIIcon";
import { ReactIcon } from "./icons/ReactIcon";
import { ReactQueryIcon } from "./icons/ReactQueryIcon";
import { TailwindIcon } from "./icons/TailwindIcon";
import { AWSCloudwatchIcon } from "./icons/AWSCloudwatchIcon";
import { AWSSQSIcon } from "./icons/AWSSQSIcon";
import { HonoJSIcon } from "./icons/HonoJSIcon";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useIntlayer } from "next-intlayer";

const SKILL_ICONS = {
  react: ReactIcon,
  "react-query": ReactQueryIcon,
  nextjs: NextJSIcon,
  tailwind: TailwindIcon,
  nodejs: NodeJSIcon,
  hono: HonoJSIcon,
  ai: OpenAIIcon,
  nestjs: NestJSIcon,
  "aws-lambda": AWSLambdaIcon,
  dynamodb: AWSDynamoIcon,
  cloudwatch: AWSCloudwatchIcon,
  sqs: AWSSQSIcon,
} as const;

export const Skills = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const content = useIntlayer("skills");

  return (
    <Section className="py-16 lg:py-24">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {content.badge.value}
          </motion.div>
          <motion.h2
            className="text-4xl lg:text-5xl font-bold mb-4 text-gradient-heading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {content.title.value}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {content.description.value}
          </motion.p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.skills.map((skill, index) => {
            const skillId = skill.id.value;
            const IconComponent =
              SKILL_ICONS[skillId as keyof typeof SKILL_ICONS];

            if (!IconComponent) return null;

            return (
              <motion.div
                key={skillId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -5 }}
                onHoverStart={() => setHoveredSkill(skillId)}
                onHoverEnd={() => setHoveredSkill(null)}
              >
                <Card
                  className={`p-6 h-full transition-all duration-300 ${
                    hoveredSkill === skillId
                      ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/10"
                      : "border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary/20">
                          <IconComponent
                            size={32}
                            className="transition-transform group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold tracking-tight mb-1">
                            {skill.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-1 h-auto"
                            >
                              {skill.category.value}
                            </Badge>
                            <span className="text-xs">
                              {skill.experience.value}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 min-w-0">
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1 h-auto border-primary/30 text-primary/80"
                        >
                          {skill.level.value}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {skill.description.value}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
