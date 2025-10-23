import { z } from "zod";

export const themeSchema = z.enum(["vs-dark", "vs-light"]);

export type Theme = z.infer<typeof themeSchema>;

export const themeConfig = {
  "vs-dark": {
    background: "bg-zinc-950",
    text: "text-zinc-50",
    border: "border-zinc-800",
  },
  "vs-light": {
    background: "bg-zinc-50",
    text: "text-zinc-950",
    border: "border-zinc-200",
  },
} as const;
