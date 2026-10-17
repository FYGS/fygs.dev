"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen } from "lucide-react";
import { ListingSection } from "./filesystem-case/listing-section";
import { SearchSection } from "./filesystem-case/search-section";
import { IndexingSection } from "./filesystem-case/indexing-section";

export function FilesystemCaseStudy() {
  const [activeTab, setActiveTab] = useState("listing");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fonction pour copier le code
  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Étude de cas : Systèmes de fichiers
        </CardTitle>
        <CardDescription>
          Comment les algorithmes de tri sont utilisés dans les systèmes de
          fichiers et les explorateurs de fichiers
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Introduction */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Les systèmes de fichiers et les explorateurs de fichiers utilisent
            des algorithmes de tri pour organiser et présenter les fichiers et
            dossiers de manière efficace. Cette étude de cas explore comment ces
            algorithmes sont implémentés et optimisés pour différents cas
            d&apos;usage.
          </p>
        </div>

        {/* Sélection des sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
            <TabsTrigger value="listing">Listage de fichiers</TabsTrigger>
            <TabsTrigger value="search">Recherche de fichiers</TabsTrigger>
            <TabsTrigger value="indexing">Indexation de fichiers</TabsTrigger>
          </TabsList>

          {/* Section Listage de fichiers */}
          <ListingSection copiedCode={copiedCode} copyCode={copyCode} />

          {/* Section Recherche de fichiers */}
          <SearchSection copiedCode={copiedCode} copyCode={copyCode} />

          {/* Section Indexation de fichiers */}
          <IndexingSection copiedCode={copiedCode} copyCode={copyCode} />
        </Tabs>
      </CardContent>
    </Card>
  );
}
