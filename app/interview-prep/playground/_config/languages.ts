import { editorDefaults } from "@/app/_config/editor-config";
import { z } from "zod";

export const languageSchema = z.enum([
  "typescript",
  "javascript",
  "html",
  "css",
  "python",
  "rust",
  "go",
]);

export type Language = z.infer<typeof languageSchema>;

export const languageDefaults = {
  ...editorDefaults,
  defaultLanguage: "typescript" as const,
};
