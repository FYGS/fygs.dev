"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { treeTypes } from "./data";
import { TreeTypeCard } from "./tree-type-card";

interface TreeTypeTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TreeTypeTabs({ activeTab, setActiveTab }: TreeTypeTabsProps) {
  return (
    <Tabs
      defaultValue="binary"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
        {treeTypes.map((type) => (
          <TabsTrigger
            key={type.id}
            value={type.id}
            className="flex items-center gap-2"
          >
            <type.icon className="h-4 w-4" />
            <span className="hidden md:inline">{type.title}</span>
            <span className="md:hidden">
              {type.id === "binary"
                ? "Bin"
                : type.id === "bst"
                ? "BST"
                : type.id === "balanced"
                ? "Éq."
                : "Graph"}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {treeTypes.map((type) => (
        <TabsContent key={type.id} value={type.id} className="space-y-6">
          <TreeTypeCard type={type} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
