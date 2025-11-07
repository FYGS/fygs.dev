"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useIntlayer } from "next-intlayer";

interface UnauthorizedPageProps {
  loginUrl?: string;
}

export function UnauthorizedPage({
  loginUrl = "/auth/login",
}: UnauthorizedPageProps) {
  const content = useIntlayer("status-unauthorized");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="w-24 h-24 mx-auto bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center"
        >
          <Lock className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {content.heading}
          </h1>
          <p className="text-muted-foreground text-lg">{content.description}</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg border space-y-4">
          <h2 className="font-semibold">{content.accessTitle}</h2>
          <ul className="text-muted-foreground space-y-2 text-left">
            <li className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              {content.loginRequired}
            </li>
            <li className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {content.goBackSuggestion}
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href={loginUrl}>
            <Button variant="default" size="lg" className="gap-2">
              <LogIn className="w-4 h-4" />
              {content.loginButton}
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {content.backButton}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
