"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";
import { useIntlayer } from "next-intlayer";

interface NotFoundPageProps {
  homeUrl?: string;
}

export function NotFoundPage({ homeUrl = "/" }: NotFoundPageProps) {
  const content = useIntlayer("status-not-found");

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const numberVariants: Variants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl mx-auto text-center space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50"
          variants={numberVariants}
        >
          404
        </motion.div>

        <motion.h1
          className="text-4xl font-bold tracking-tight"
          variants={itemVariants}
        >
          {content.heading}
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-lg"
          variants={itemVariants}
        >
          {content.description}
        </motion.p>

        <motion.div
          className="bg-card rounded-lg p-6 shadow-lg border"
          variants={itemVariants}
        >
          <h2 className="font-semibold mb-4">{content.suggestionsTitle}</h2>
          <ul className="text-muted-foreground space-y-2 text-left">
            <li className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {content.checkUrl}
            </li>
            <li className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {content.goBack}
            </li>
            <li className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              {content.goHome}
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          variants={itemVariants}
        >
          <Button
            variant="default"
            size="lg"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {content.backButton}
          </Button>
          <Link href={homeUrl}>
            <Button variant="secondary" size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              {content.homeButton}
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
