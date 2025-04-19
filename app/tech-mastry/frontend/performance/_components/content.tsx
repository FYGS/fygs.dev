"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { MemoizationSection } from "./sections/memoization-section";
import { CodeSplittingSection } from "./sections/code-splitting-section";
import { BundleSizeSection } from "./sections/bundle-size-section";
import { VirtualizationSection } from "./sections/virtualization-section";
import { RenderingOptimizationSection } from "./sections/rendering-optimization-section";

export function PerformanceContent() {
  const [activeTab, setActiveTab] = useState("memoization");

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 w-full">
          <TabsTrigger value="memoization">Memoization</TabsTrigger>
          <TabsTrigger value="code-splitting">Code Splitting</TabsTrigger>
          <TabsTrigger value="bundle-size">Bundle Size</TabsTrigger>
          <TabsTrigger value="virtualization">Virtualization</TabsTrigger>
          <TabsTrigger value="rendering">Rendering</TabsTrigger>
        </TabsList>

        <TabsContent value="memoization" className="mt-6">
          <MemoizationSection />
        </TabsContent>

        <TabsContent value="code-splitting" className="mt-6">
          <CodeSplittingSection />
        </TabsContent>

        <TabsContent value="bundle-size" className="mt-6">
          <BundleSizeSection />
        </TabsContent>

        <TabsContent value="virtualization" className="mt-6">
          <VirtualizationSection />
        </TabsContent>

        <TabsContent value="rendering" className="mt-6">
          <RenderingOptimizationSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
