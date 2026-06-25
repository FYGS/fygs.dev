"use client";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRouter } from "next/navigation";
import { useTheme } from "./theme-provider";

export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();

  useKeyboardShortcuts([
    {
      key: "h",
      action: () => router.push("/"),
      description: "Go to Home",
    },
    {
      key: "p",
      action: () => router.push("/projects"),
      description: "Go to Projects",
    },
    {
      key: "r",
      action: () => router.push("/me"),
      description: "Go to Resume",
    },
    {
      key: "b",
      action: () => router.push("/blog"),
      description: "Go to Blog",
    },
    {
      key: "l",
      command: true,
      shift: true,
      action: () => setTheme("light"),
      description: "Switch to light theme",
    },
    {
      key: "d",
      command: true,
      shift: true,
      action: () => setTheme("dark"),
      description: "Switch to dark theme",
    },
  ]);

  return <>{children}</>;
}
