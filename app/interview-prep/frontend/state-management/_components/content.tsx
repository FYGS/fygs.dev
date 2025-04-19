"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ContextApiSection } from "./sections/context-api-section";
import { ReduxSection } from "./sections/redux-section";
import { ZustandSection } from "./sections/zustand-section";
import { ReactQuerySection } from "./sections/react-query-section";
import { ComparisonSection } from "./sections/comparison-section";

export function StateManagementContent() {
  const [activeTab, setActiveTab] = useState("context-api");

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="context-api">Context API</TabsTrigger>
          <TabsTrigger value="redux">Redux</TabsTrigger>
          <TabsTrigger value="zustand">Zustand</TabsTrigger>
          <TabsTrigger value="react-query">React Query</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
        </TabsList>

        <TabsContent value="context-api" className="mt-6">
          <ContextApiSection />
        </TabsContent>

        <TabsContent value="redux" className="mt-6">
          <ReduxSection />
        </TabsContent>

        <TabsContent value="zustand" className="mt-6">
          <ZustandSection />
        </TabsContent>

        <TabsContent value="react-query" className="mt-6">
          <ReactQuerySection />
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <ComparisonSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
