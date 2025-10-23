"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { CompoundComponentsSection } from "./sections/compound-components-section";
import { RenderPropsSection } from "./sections/render-props-section";
import { HOCSection } from "./sections/hoc-section";
import { CustomHooksSection } from "./sections/custom-hooks-section";
import { StateReducerSection } from "./sections/state-reducer-section";
import { ControlledComponentsSection } from "./sections/controlled-components-section";

export function ComponentPatternsContent() {
  const [activeTab, setActiveTab] = useState("compound-components");

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="compound-components">Compound</TabsTrigger>
          <TabsTrigger value="render-props">Render Props</TabsTrigger>
          <TabsTrigger value="hoc">HOC</TabsTrigger>
          <TabsTrigger value="custom-hooks">Custom Hooks</TabsTrigger>
          <TabsTrigger value="state-reducer">State Reducer</TabsTrigger>
          <TabsTrigger value="controlled">Controlled</TabsTrigger>
        </TabsList>

        <TabsContent value="compound-components" className="mt-6">
          <CompoundComponentsSection />
        </TabsContent>

        <TabsContent value="render-props" className="mt-6">
          <RenderPropsSection />
        </TabsContent>

        <TabsContent value="hoc" className="mt-6">
          <HOCSection />
        </TabsContent>

        <TabsContent value="custom-hooks" className="mt-6">
          <CustomHooksSection />
        </TabsContent>

        <TabsContent value="state-reducer" className="mt-6">
          <StateReducerSection />
        </TabsContent>

        <TabsContent value="controlled" className="mt-6">
          <ControlledComponentsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
