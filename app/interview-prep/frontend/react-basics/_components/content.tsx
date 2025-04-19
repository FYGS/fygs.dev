"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ComponentsSection } from "./sections/components-section";
import { ContextSection } from "./sections/context-section";
import { HooksSection } from "./sections/hooks-section";
import { LifecycleSection } from "./sections/lifecycle-section";
import { PropsStateSection } from "./sections/props-state-section";

export function ReactBasicsContent() {
  const [activeTab, setActiveTab] = useState("components");

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="components">Composants</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="props-state">Props & State</TabsTrigger>
          <TabsTrigger value="context">Context API</TabsTrigger>
          <TabsTrigger value="lifecycle">Cycle de Vie</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="mt-6">
          <ComponentsSection />
        </TabsContent>

        <TabsContent value="hooks" className="mt-6">
          <HooksSection />
        </TabsContent>

        <TabsContent value="props-state" className="mt-6">
          <PropsStateSection />
        </TabsContent>

        <TabsContent value="context" className="mt-6">
          <ContextSection />
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-6">
          <LifecycleSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
