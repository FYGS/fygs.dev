"use client";

import { useCommandStore } from "@/lib/command-store";
import { useTheme } from "@/providers/theme-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRegisterCommands() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { registerCommand, unregisterCommand } = useCommandStore();

  useEffect(() => {
    const commands = [
      {
        id: "theme.toggle-light",
        title: "Switch to Light Theme",
        category: "Theme",
        shortcut: ["Ctrl", "Shift", "L"],
        keywords: ["light", "theme", "mode"],
        action: () => setTheme("light"),
      },
      {
        id: "theme.toggle-dark",
        title: "Switch to Dark Theme",
        category: "Theme",
        shortcut: ["Ctrl", "Shift", "D"],
        keywords: ["dark", "theme", "mode"],
        action: () => setTheme("dark"),
      },
      {
        id: "navigation.home",
        title: "Go to Home",
        category: "Navigation",
        shortcut: ["G", "H"],
        keywords: ["home", "main", "index"],
        action: () => router.push("/"),
      },
      {
        id: "navigation.projects",
        title: "Go to Projects",
        category: "Navigation",
        shortcut: ["G", "P"],
        keywords: ["projects", "portfolio", "work"],
        action: () => router.push("/projects"),
      },
      {
        id: "navigation.resume",
        title: "Go to Resume",
        category: "Navigation",
        shortcut: ["G", "R"],
        keywords: ["resume", "cv", "experience"],
        action: () => router.push("/me"),
      },
      {
        id: "navigation.blog",
        title: "Go to Blog",
        category: "Navigation",
        shortcut: ["G", "B"],
        keywords: ["blog", "articles", "posts"],
        action: () => router.push("/blog"),
      },
      {
        id: "social.github",
        title: "Open GitHub Profile",
        category: "Social",
        keywords: ["github", "code", "repository"],
        action: () => window.open("https://github.com/fygs", "_blank"),
      },
      {
        id: "social.linkedin",
        title: "Open LinkedIn Profile",
        category: "Social",
        keywords: ["linkedin", "network", "professional"],
        action: () =>
          window.open("https://www.linkedin.com/in/fernandsoualo", "_blank"),
      },
    ];

    commands.forEach(registerCommand);
    return () => commands.forEach((cmd) => unregisterCommand(cmd.id));
  }, [registerCommand, unregisterCommand, router, setTheme]);
}
