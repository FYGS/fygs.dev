"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useEditorStore } from "../_stores/editor-store";

export function EditorOptions() {
  const { settings, updateSettings } = useEditorStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="minimap">Minimap</Label>
        <Switch
          id="minimap"
          checked={settings.minimap}
          onCheckedChange={(checked) => updateSettings({ minimap: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label>Font Size</Label>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([value]) => updateSettings({ fontSize: value })}
          min={12}
          max={24}
          step={1}
        />
        <div className="text-xs text-muted-foreground text-right">
          {settings.fontSize}px
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="wordWrap">Word Wrap</Label>
        <Switch
          id="wordWrap"
          checked={settings.wordWrap}
          onCheckedChange={(checked) => updateSettings({ wordWrap: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="autoComplete">Auto Complete</Label>
        <Switch
          id="autoComplete"
          checked={settings.autoComplete}
          onCheckedChange={(checked) =>
            updateSettings({ autoComplete: checked })
          }
        />
      </div>
    </div>
  );
}
