"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import type { EditorSettings } from "../_types";
import { usePlaygroundStore } from "../_stores/playground-store";

export function PgSettingsDialog() {
  const [open, setOpen] = useState(false);
  const settings = usePlaygroundStore((s) => s.settings);
  const theme = usePlaygroundStore((s) => s.theme);
  const updateSettings = usePlaygroundStore((s) => s.updateSettings);
  const setTheme = usePlaygroundStore((s) => s.setTheme);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("pg-open-settings", handler);
    return () => window.removeEventListener("pg-open-settings", handler);
  }, []);

  const handleChange = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K],
  ) => {
    updateSettings({ [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md bg-[#1e1e1e] text-white border-border/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Editor Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Customize your editor experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Theme */}
          <SettingRow label="Theme">
            <Select value={theme} onValueChange={(v) => setTheme(v)}>
              <SelectTrigger className="h-8 w-40 bg-muted/20 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vs-dark">VS Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="high-contrast">High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          {/* Font Size */}
          <SettingRow label="Font Size">
            <Select
              value={String(settings.fontSize)}
              onValueChange={(v) => handleChange("fontSize", Number(v))}
            >
              <SelectTrigger className="h-8 w-40 bg-muted/20 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 11, 12, 13, 14, 15, 16, 18, 20].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          {/* Tab Size */}
          <SettingRow label="Tab Size">
            <Select
              value={String(settings.tabSize)}
              onValueChange={(v) => handleChange("tabSize", Number(v))}
            >
              <SelectTrigger className="h-8 w-40 bg-muted/20 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 4, 8].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} spaces
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <Separator className="bg-border/20" />

          {/* Toggle settings */}
          <SettingToggle
            label="Minimap"
            checked={settings.minimap}
            onChange={(v) => handleChange("minimap", v)}
          />
          <SettingRow label="Word Wrap">
            <Select
              value={settings.wordWrap}
              onValueChange={(v) =>
                handleChange("wordWrap", v as EditorSettings["wordWrap"])
              }
            >
              <SelectTrigger className="h-8 w-40 bg-muted/20 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on">On</SelectItem>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="wordWrapColumn">Column</SelectItem>
                <SelectItem value="bounded">Bounded</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow label="Line Numbers">
            <Select
              value={settings.lineNumbers}
              onValueChange={(v) =>
                handleChange("lineNumbers", v as EditorSettings["lineNumbers"])
              }
            >
              <SelectTrigger className="h-8 w-40 bg-muted/20 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on">On</SelectItem>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="relative">Relative</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingToggle
            label="Bracket Pair Colorization"
            checked={settings.bracketPairColorization}
            onChange={(v) => handleChange("bracketPairColorization", v)}
          />
          <SettingToggle
            label="Format on Save"
            checked={settings.formatOnSave}
            onChange={(v) => handleChange("formatOnSave", v)}
          />
          <SettingToggle
            label="Smooth Scrolling"
            checked={settings.smoothScrolling}
            onChange={(v) => handleChange("smoothScrolling", v)}
          />
          <SettingToggle
            label="Sticky Scroll"
            checked={settings.stickyScroll}
            onChange={(v) => handleChange("stickyScroll", v)}
          />

          <Separator className="bg-border/20" />

          {/* Cursor Style */}
          <SettingRow label="Cursor Style">
            <Select
              value={settings.cursorStyle}
              onValueChange={(v) =>
                handleChange("cursorStyle", v as EditorSettings["cursorStyle"])
              }
            >
              <SelectTrigger className="h-8 w-40 bg-muted/20 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          {/* Cursor Blinking */}
          <SettingRow label="Cursor Blinking">
            <Select
              value={settings.cursorBlinking}
              onValueChange={(v) =>
                handleChange(
                  "cursorBlinking",
                  v as EditorSettings["cursorBlinking"],
                )
              }
            >
              <SelectTrigger className="h-8 w-40 bg-muted/20 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blink">Blink</SelectItem>
                <SelectItem value="smooth">Smooth</SelectItem>
                <SelectItem value="phase">Phase</SelectItem>
                <SelectItem value="expand">Expand</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          {/* Render Whitespace */}
          <SettingRow label="Render Whitespace">
            <Select
              value={settings.renderWhitespace}
              onValueChange={(v) =>
                handleChange(
                  "renderWhitespace",
                  v as EditorSettings["renderWhitespace"],
                )
              }
            >
              <SelectTrigger className="h-8 w-40 bg-muted/20 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="boundary">Boundary</SelectItem>
                <SelectItem value="selection">Selection</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm text-white/90">{label}</Label>
      {children}
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm text-white/90">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
