"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "../_hooks/use-language";
import { Label } from "@/components/ui/label";

const LANGUAGES = ["typescript", "javascript", "python"] as const;

export function LanguageSelect() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="space-y-2">
      <Label>Language</Label>
      <Select value={language} onValueChange={changeLanguage}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
