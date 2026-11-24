"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server } from "lucide-react";
import { useState } from "react";
import { ApiSection } from "./server-case/api-section";
import { LogsSection } from "./server-case/logs-section";
import { CacheSection } from "./server-case/cache-section";

export function ServerCaseStudy() {
  const [activeTab, setActiveTab] = useState("api");
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
          <Server className="w-5 h-5 text-primary" />
          Étude de cas : Serveurs Web
        </CardTitle>
        <CardDescription>
          Comment les algorithmes de tri sont utilisés dans les serveurs web et
          les applications backend
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Introduction */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Les serveurs web et les applications backend utilisent des
            algorithmes de tri pour optimiser le traitement des requêtes, la
            gestion des données et les performances globales. Cette étude de cas
            explore comment ces algorithmes sont implémentés dans différents
            contextes d&apos;applications web.
          </p>
        </div>

        {/* Sélection des sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
            <TabsTrigger value="api">API REST</TabsTrigger>
            <TabsTrigger value="logs">Analyse de logs</TabsTrigger>
            <TabsTrigger value="cache">Gestion du cache</TabsTrigger>
          </TabsList>

          {/* Section API REST */}
          <ApiSection copiedCode={copiedCode} copyCode={copyCode} />

          {/* Section Analyse de logs */}
          <LogsSection copiedCode={copiedCode} copyCode={copyCode} />

          {/* Section Gestion du cache */}
          <CacheSection copiedCode={copiedCode} copyCode={copyCode} />
        </Tabs>
      </CardContent>
    </Card>
  );
}
