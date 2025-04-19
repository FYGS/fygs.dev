"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { AriaSection } from "./sections/aria-section";
import { KeyboardNavigationSection } from "./sections/keyboard-navigation-section";
import { ColorContrastSection } from "./sections/color-contrast-section";
import { ScreenReadersSection } from "./sections/screen-readers-section";

export function AccessibilityContent() {
  const [activeTab, setActiveTab] = useState("aria");

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="aria">ARIA</TabsTrigger>
          <TabsTrigger value="keyboard">Keyboard Navigation</TabsTrigger>
          <TabsTrigger value="contrast">Color Contrast</TabsTrigger>
          <TabsTrigger value="screen-readers">Screen Readers</TabsTrigger>
        </TabsList>

        <TabsContent value="aria" className="mt-6">
          <AriaSection />
        </TabsContent>

        <TabsContent value="keyboard" className="mt-6">
          <KeyboardNavigationSection />
        </TabsContent>

        <TabsContent value="contrast" className="mt-6">
          <ColorContrastSection />
        </TabsContent>

        <TabsContent value="screen-readers" className="mt-6">
          <ScreenReadersSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
