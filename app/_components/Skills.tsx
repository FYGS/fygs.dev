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

const SKILLS = [
  {
    id: "react",
    icon: ReactIcon,
    title: "React",
    description: "My go-to library for building dynamic and responsive web applications. I leverage React to create seamless user experiences and efficient component-based architectures.",
    level: "Expert",
    experience: "5+ years",
    category: "Frontend"
  },
  {
    id: "react-query",
    icon: ReactQueryIcon,
    title: "React Query",
    description: "I utilize React Query for advanced data fetching and state management in React applications. It simplifies complex data synchronization tasks and enhances application performance.",
    level: "Advanced",
    experience: "3+ years",
    category: "Frontend"
  },
  {
    id: "nextjs",
    icon: NextJSIcon,
    title: "Next.js",
    description: "My preferred framework for building fullstack applications. With Next.js, I create highly optimized and scalable web solutions, leveraging its powerful features like server-side rendering and static site generation.",
    level: "Expert",
    experience: "4+ years",
    category: "Fullstack"
  },
  {
    id: "tailwind",
    icon: TailwindIcon,
    title: "Tailwind CSS",
    description: "I craft visually appealing and responsive designs using Tailwind CSS. Its utility-first approach allows for rapid development and consistent styling across projects.",
    level: "Advanced",
    experience: "4+ years",
    category: "Frontend"
  },
  {
    id: "nodejs",
    icon: NodeJSIcon,
    title: "Node.js",
    description: "I build scalable and high-performance backend services with Node.js. Its event-driven architecture and extensive ecosystem make it ideal for developing efficient server-side applications.",
    level: "Expert",
    experience: "5+ years",
    category: "Backend"
  },
  {
    id: "hono",
    icon: HonoJSIcon,
    title: "Hono.js",
    description: "I appreciate the simplicity and performance of Hono.js for building web applications. Its lightweight nature and fast routing capabilities make it a great choice for efficient and scalable projects.",
    level: "Advanced",
    experience: "2+ years",
    category: "Backend"
  },
  {
    id: "ai",
    icon: OpenAIIcon,
    title: "AI Integration",
    description: "I integrate advanced AI models into applications, unlocking new possibilities for automation, natural language processing, and intelligent decision-making.",
    level: "Advanced",
    experience: "3+ years",
    category: "AI/ML"
  },
  {
    id: "nestjs",
    icon: NestJSIcon,
    title: "Nest.js",
    description: "I develop robust and maintainable backend applications with Nest.js. Its modular architecture and TypeScript support enable the creation of scalable and efficient server-side solutions.",
    level: "Expert",
    experience: "4+ years",
    category: "Backend"
  },
  {
    id: "aws-lambda",
    icon: AWSLambdaIcon,
    title: "AWS Lambda",
    description: "I leverage AWS Lambda for building serverless applications, allowing for efficient scaling and cost-effective solutions. Its event-driven architecture is perfect for microservices and automated processing tasks.",
    level: "Advanced",
    experience: "3+ years",
    category: "Cloud"
  },
 {
    id: "dynamodb",
    icon: AWSDynamoIcon,
    title: "AWS DynamoDB",
    description: "I utilize AWS DynamoDB for its fast and flexible NoSQL database capabilities. It's excellent for applications requiring low-latency data access at any scale. I appreciate its seamless integration with other AWS services and its ability to handle diverse workloads efficiently.",
    level: "Advanced",
    experience: "3+ years",
    category: "Cloud"
  },
  {
    id: "cloudwatch",
    icon: AWSCloudwatchIcon,
    title: "AWS CloudWatch",
    description: "I use AWS CloudWatch for comprehensive monitoring and observability of AWS resources and applications. It provides valuable insights through logs, metrics, and alarms, enabling proactive management and troubleshooting of cloud infrastructure. CloudWatch's real-time monitoring capabilities are crucial for maintaining high availability and performance of AWS-based systems.",
    level: "Intermediate",
    experience: "2+ years",
    category: "Cloud"
  },
  {
    id: "sqs",
    icon: AWSSQSIcon,
    title: "AWS SQS",
    description: "I leverage AWS SQS (Simple Queue Service) for building decoupled and scalable microservices architectures. It provides a reliable, highly-scalable, and fully-managed message queuing service that enables asynchronous communication between distributed system components. SQS helps in managing workload spikes, reducing dependencies between services, and ensuring fault tolerance in distributed applications.",
    level: "Advanced",
    experience: "3+ years",
    category: "Cloud"
  }
];

export const Skills = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

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
            Technical Expertise
          </motion.div>
          <motion.h2
            className="text-4xl lg:text-5xl font-bold mb-4 bg-linear-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Skills & Technologies
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            A comprehensive overview of my technical expertise across various domains and technologies
          </motion.p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SKILLS.map((skill, index) => {
            const IconComponent = skill.icon;
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -5 }}
                onHoverStart={() => setHoveredSkill(skill.id)}
                onHoverEnd={() => setHoveredSkill(null)}
              >
                <Card className={`p-6 h-full transition-all duration-300 ${
                  hoveredSkill === skill.id
                    ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/10"
                    : "border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                }`}>
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
                            <Badge variant="secondary" className="text-xs px-2 py-1 h-auto">
                              {skill.category}
                            </Badge>
                            <span className="text-xs">{skill.experience}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 min-w-0">
                        <Badge variant="outline" className="text-xs px-2 py-1 h-auto border-primary/30 text-primary/80">
                          {skill.level}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {skill.description}
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
