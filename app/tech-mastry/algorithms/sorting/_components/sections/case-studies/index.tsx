"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FolderOpen, Lightbulb, Server } from "lucide-react";
import { useState } from "react";

// Importer les études de cas
import { DatabaseCaseStudy } from "./database-case";
import { FilesystemCaseStudy } from "./filesystem-case";
import { ServerCaseStudy } from "./server-case";

// Types pour les études de cas
type CaseStudyType = "database" | "filesystem" | "server";

export function DetailedCaseStudies() {
  const [caseType, setCaseType] = useState<CaseStudyType>("database");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Études de Cas Détaillées
          </CardTitle>
          <CardDescription>
            Explorez en profondeur comment les algorithmes de tri sont
            implémentés dans des systèmes réels
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection de l'étude de cas */}
          <Tabs
            value={caseType}
            onValueChange={(value) => setCaseType(value as CaseStudyType)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
              <TabsTrigger value="database" className="gap-2">
                <Database className="w-4 h-4" />
                <span>Bases de données</span>
              </TabsTrigger>
              <TabsTrigger value="filesystem" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                <span>Systèmes de fichiers</span>
              </TabsTrigger>
              <TabsTrigger value="server" className="gap-2">
                <Server className="w-4 h-4" />
                <span>Serveurs Web</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenu des études de cas */}
            <TabsContent value="database" className="mt-6">
              <DatabaseCaseStudy />
            </TabsContent>

            <TabsContent value="filesystem" className="mt-6">
              <FilesystemCaseStudy />
            </TabsContent>

            <TabsContent value="server" className="mt-6">
              <ServerCaseStudy />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
