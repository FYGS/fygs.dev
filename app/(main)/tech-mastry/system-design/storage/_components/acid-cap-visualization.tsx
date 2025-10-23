"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Layers,
  Lock,
  Shield,
  SplitSquareVertical,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export function AcidCapVisualization() {
  // State for active tab (visualization or explanation)
  const [activeTab, setActiveTab] = useState("visualization");

  // State for active visualization (ACID or CAP)
  const [activeVisualization, setActiveVisualization] = useState<
    "acid" | "cap"
  >("acid");

  // State for active ACID property
  const [activeAcidProperty, setActiveAcidProperty] = useState<
    "atomicity" | "consistency" | "isolation" | "durability"
  >("atomicity");

  // State for active CAP property
  const [activeCapProperty, setActiveCapProperty] = useState<
    "consistency" | "availability" | "partition-tolerance"
  >("consistency");

  // State for database type in CAP visualization
  const [databaseType, setDatabaseType] = useState<"cp" | "ap" | "ca">("cp");

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Propriétés ACID & Théorème CAP
        </CardTitle>
        <CardDescription>
          Comprendre les garanties transactionnelles et les compromis des
          systèmes distribués
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Visualization Type Selector */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-md border p-1 bg-muted/30">
                <Button
                  variant={activeVisualization === "acid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveVisualization("acid")}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>ACID</span>
                </Button>
                <Button
                  variant={activeVisualization === "cap" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveVisualization("cap")}
                  className="flex items-center gap-1"
                >
                  <SplitSquareVertical className="h-4 w-4" />
                  <span>CAP</span>
                </Button>
              </div>
            </div>

            {/* ACID Visualization */}
            {activeVisualization === "acid" && (
              <div className="space-y-4">
                {/* ACID Property Selector */}
                <div className="flex justify-center mb-4">
                  <div className="inline-flex rounded-md border p-1 bg-muted/30">
                    <Button
                      variant={
                        activeAcidProperty === "atomicity" ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => setActiveAcidProperty("atomicity")}
                      className="flex items-center gap-1"
                    >
                      <Layers className="h-4 w-4" />
                      <span>Atomicité</span>
                    </Button>
                    <Button
                      variant={
                        activeAcidProperty === "consistency"
                          ? "default"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() => setActiveAcidProperty("consistency")}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Cohérence</span>
                    </Button>
                    <Button
                      variant={
                        activeAcidProperty === "isolation" ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => setActiveAcidProperty("isolation")}
                      className="flex items-center gap-1"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Isolation</span>
                    </Button>
                    <Button
                      variant={
                        activeAcidProperty === "durability"
                          ? "default"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() => setActiveAcidProperty("durability")}
                      className="flex items-center gap-1"
                    >
                      <Database className="h-4 w-4" />
                      <span>Durabilité</span>
                    </Button>
                  </div>
                </div>

                {/* ACID Visualization Canvas */}
                <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
                  <div className="p-4 h-full flex flex-col">
                    {/* ACID Visualization */}
                    <div className="h-full">
                      {/* Atomicity Visualization */}
                      {activeAcidProperty === "atomicity" && (
                        <div className="h-full flex flex-col">
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                              <Layers className="h-5 w-5 text-primary" />
                              Atomicité
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Une transaction est entièrement exécutée ou
                              entièrement annulée
                            </p>
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Successful Transaction */}
                            <div className="border rounded-md p-4 bg-card flex flex-col">
                              <div className="text-center mb-4">
                                <h4 className="font-medium text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  Transaction Réussie
                                </h4>
                              </div>

                              <div className="flex-1 flex flex-col justify-center">
                                <div className="space-y-6">
                                  <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium">
                                        1
                                      </div>
                                      <div className="text-sm">
                                        Débit du compte A: 100€
                                      </div>
                                    </div>
                                    <div className="ml-3 h-6 border-l-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                                  </div>

                                  <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium">
                                        2
                                      </div>
                                      <div className="text-sm">
                                        Crédit du compte B: 100€
                                      </div>
                                    </div>
                                    <div className="ml-3 h-6 border-l-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                                  </div>

                                  <div className="relative">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-medium">
                                        3
                                      </div>
                                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                        COMMIT
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                  <div className="text-sm text-green-700 dark:text-green-300">
                                    <span className="font-medium">
                                      Résultat:
                                    </span>{" "}
                                    Toutes les opérations sont appliquées. Le
                                    compte A est débité et le compte B est
                                    crédité.
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Failed Transaction */}
                            <div className="border rounded-md p-4 bg-card flex flex-col">
                              <div className="text-center mb-4">
                                <h4 className="font-medium text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                                  <XCircle className="h-4 w-4" />
                                  Transaction Échouée
                                </h4>
                              </div>

                              <div className="flex-1 flex flex-col justify-center">
                                <div className="space-y-6">
                                  <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium">
                                        1
                                      </div>
                                      <div className="text-sm">
                                        Débit du compte A: 100€
                                      </div>
                                    </div>
                                    <div className="ml-3 h-6 border-l-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                                  </div>

                                  <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-medium">
                                        2
                                      </div>
                                      <div className="text-sm">
                                        <span className="line-through">
                                          Crédit du compte B: 100€
                                        </span>
                                        <span className="text-red-500 ml-2">
                                          ✗ Erreur
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-3 h-6 border-l-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                                  </div>

                                  <div className="relative">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-medium">
                                        3
                                      </div>
                                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                        ROLLBACK
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                  <div className="text-sm text-red-700 dark:text-red-300">
                                    <span className="font-medium">
                                      Résultat:
                                    </span>{" "}
                                    Toutes les opérations sont annulées. Le
                                    compte A n&apos;est pas débité, même si
                                    cette opération avait réussi.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Consistency Visualization */}
                      {activeAcidProperty === "consistency" && (
                        <div className="h-full flex flex-col">
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Cohérence
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Une transaction fait passer la base de données
                              d&apos;un état valide à un autre état valide
                            </p>
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Valid Transaction */}
                            <div className="border rounded-md p-4 bg-card flex flex-col">
                              <div className="text-center mb-4">
                                <h4 className="font-medium text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  Transaction Valide
                                </h4>
                              </div>

                              <div className="flex-1 flex flex-col">
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                  <div className="text-sm font-medium mb-1">
                                    Contrainte d&apos;intégrité:
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Le solde d&apos;un compte ne peut pas être
                                    négatif
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="p-3 border rounded-md">
                                    <div className="text-sm font-medium mb-1">
                                      État initial:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                        <div className="font-medium">
                                          Compte A
                                        </div>
                                        <div>Solde: 500€</div>
                                      </div>
                                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                        <div className="font-medium">
                                          Compte B
                                        </div>
                                        <div>Solde: 200€</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 border rounded-md">
                                    <div className="text-sm font-medium mb-1">
                                      Transaction:
                                    </div>
                                    <div className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                      <div>
                                        Transférer 300€ du compte A vers le
                                        compte B
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 border rounded-md">
                                    <div className="text-sm font-medium mb-1">
                                      État final:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                        <div className="font-medium">
                                          Compte A
                                        </div>
                                        <div>Solde: 200€</div>
                                      </div>
                                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                        <div className="font-medium">
                                          Compte B
                                        </div>
                                        <div>Solde: 500€</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-auto p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                  <div className="text-sm text-green-700 dark:text-green-300">
                                    <span className="font-medium">
                                      Résultat:
                                    </span>{" "}
                                    La transaction maintient la cohérence. Aucun
                                    compte n&apos;a un solde négatif après la
                                    transaction.
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Invalid Transaction */}
                            <div className="border rounded-md p-4 bg-card flex flex-col">
                              <div className="text-center mb-4">
                                <h4 className="font-medium text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                                  <XCircle className="h-4 w-4" />
                                  Transaction Invalide
                                </h4>
                              </div>

                              <div className="flex-1 flex flex-col">
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                  <div className="text-sm font-medium mb-1">
                                    Contrainte d&apos;intégrité:
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Le solde d&apos;un compte ne peut pas être
                                    négatif
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="p-3 border rounded-md">
                                    <div className="text-sm font-medium mb-1">
                                      État initial:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                        <div className="font-medium">
                                          Compte A
                                        </div>
                                        <div>Solde: 200€</div>
                                      </div>
                                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                        <div className="font-medium">
                                          Compte B
                                        </div>
                                        <div>Solde: 100€</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 border rounded-md">
                                    <div className="text-sm font-medium mb-1">
                                      Transaction:
                                    </div>
                                    <div className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                      <div>
                                        Transférer 300€ du compte A vers le
                                        compte B
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 border rounded-md">
                                    <div className="text-sm font-medium mb-1">
                                      État final (rejeté):
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                        <div className="font-medium">
                                          Compte A
                                        </div>
                                        <div className="text-red-600 dark:text-red-400">
                                          Solde: -100€
                                        </div>
                                      </div>
                                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                        <div className="font-medium">
                                          Compte B
                                        </div>
                                        <div>Solde: 400€</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-auto p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                  <div className="text-sm text-red-700 dark:text-red-300">
                                    <span className="font-medium">
                                      Résultat:
                                    </span>{" "}
                                    La transaction est rejetée car elle
                                    violerait la contrainte d&apos;intégrité
                                    (solde négatif pour le compte A).
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Isolation Visualization */}
                      {activeAcidProperty === "isolation" && (
                        <div className="h-full flex flex-col">
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                              <Lock className="h-5 w-5 text-primary" />
                              Isolation
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Les transactions sont exécutées comme si elles
                              étaient séquentielles, même en parallèle
                            </p>
                          </div>

                          <div className="flex-1 grid grid-cols-1 gap-6">
                            <div className="border rounded-md p-4 bg-card">
                              <div className="text-center mb-4">
                                <h4 className="font-medium flex items-center justify-center gap-1">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                  Problèmes sans Isolation
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Dirty Read */}
                                <div className="p-3 border rounded-md">
                                  <div className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Lecture Sale (Dirty Read)
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    Une transaction lit des données qui
                                    n&apos;ont pas encore été validées par une
                                    autre transaction.
                                  </div>
                                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                    <div className="mb-1">
                                      <span className="font-medium">T1:</span>{" "}
                                      Débute, met à jour le solde de A à 500€
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T2:</span>{" "}
                                      Débute, lit le solde de A (500€)
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T1:</span>{" "}
                                      Annule la transaction (rollback)
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T2:</span>{" "}
                                      Utilise la valeur 500€ (incorrecte)
                                    </div>
                                  </div>
                                </div>

                                {/* Non-repeatable Read */}
                                <div className="p-3 border rounded-md">
                                  <div className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Lecture Non-Répétable
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    Une transaction relit des données
                                    qu&apos;elle a déjà lues et trouve que les
                                    données ont été modifiées.
                                  </div>
                                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                    <div className="mb-1">
                                      <span className="font-medium">T1:</span>{" "}
                                      Débute, lit le solde de A (200€)
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T2:</span>{" "}
                                      Débute, met à jour le solde de A à 500€,
                                      valide
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T1:</span>{" "}
                                      Relit le solde de A (maintenant 500€)
                                    </div>
                                  </div>
                                </div>

                                {/* Phantom Read */}
                                <div className="p-3 border rounded-md">
                                  <div className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Lecture Fantôme
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    Une transaction relit un ensemble de lignes
                                    qui satisfont une condition et trouve que de
                                    nouvelles lignes ont été ajoutées.
                                  </div>
                                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                    <div className="mb-1">
                                      <span className="font-medium">T1:</span>{" "}
                                      Débute, lit tous les comptes avec solde
                                      &gt; 1000€
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T2:</span>{" "}
                                      Débute, crée un nouveau compte avec 5000€,
                                      valide
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T1:</span>{" "}
                                      Relit les comptes avec solde &gt; 1000€
                                      (trouve un nouveau compte)
                                    </div>
                                  </div>
                                </div>

                                {/* Lost Update */}
                                <div className="p-3 border rounded-md">
                                  <div className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Mise à Jour Perdue
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    Deux transactions lisent et mettent à jour
                                    la même donnée, et l&apos;une écrase les
                                    modifications de l&apos;autre.
                                  </div>
                                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                    <div className="mb-1">
                                      <span className="font-medium">T1:</span>{" "}
                                      Débute, lit le solde de A (1000€)
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T2:</span>{" "}
                                      Débute, lit le solde de A (1000€)
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T1:</span>{" "}
                                      Ajoute 200€, écrit 1200€, valide
                                    </div>
                                    <div className="mb-1">
                                      <span className="font-medium">T2:</span>{" "}
                                      Soustrait 500€, écrit 500€, valide (perte
                                      de T1)
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="border rounded-md p-4 bg-card">
                              <div className="text-center mb-4">
                                <h4 className="font-medium flex items-center justify-center gap-1">
                                  <Lock className="h-4 w-4 text-primary" />
                                  Niveaux d&apos;Isolation
                                </h4>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="bg-muted/50">
                                      <th className="p-2 text-left border">
                                        Niveau d&apos;Isolation
                                      </th>
                                      <th className="p-2 text-center border">
                                        Lecture Sale
                                      </th>
                                      <th className="p-2 text-center border">
                                        Lecture Non-Répétable
                                      </th>
                                      <th className="p-2 text-center border">
                                        Lecture Fantôme
                                      </th>
                                      <th className="p-2 text-center border">
                                        Mise à Jour Perdue
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="p-2 border font-medium">
                                        Read Uncommitted
                                      </td>
                                      <td className="p-2 border text-center">
                                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                                      </td>
                                    </tr>
                                    <tr className="bg-muted/20">
                                      <td className="p-2 border font-medium">
                                        Read Committed
                                      </td>
                                      <td className="p-2 border text-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="p-2 border font-medium">
                                        Repeatable Read
                                      </td>
                                      <td className="p-2 border text-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                      </td>
                                    </tr>
                                    <tr className="bg-muted/20">
                                      <td className="p-2 border font-medium">
                                        Serializable
                                      </td>
                                      <td className="p-2 border text-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                      </td>
                                      <td className="p-2 border text-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div className="mt-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1 mb-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>Prévient le problème</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <XCircle className="h-3 w-3 text-red-500" />
                                  <span>Ne prévient pas le problème</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Durability Visualization */}
                      {activeAcidProperty === "durability" && (
                        <div className="h-full flex flex-col">
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                              <Database className="h-5 w-5 text-primary" />
                              Durabilité
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Une fois validées, les modifications sont
                              permanentes, même en cas de panne
                            </p>
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Durability Mechanisms */}
                            <div className="border rounded-md p-4 bg-card flex flex-col">
                              <div className="text-center mb-4">
                                <h4 className="font-medium text-primary flex items-center justify-center gap-1">
                                  <Database className="h-4 w-4" />
                                  Mécanismes de Durabilité
                                </h4>
                              </div>

                              <div className="space-y-4">
                                <div className="p-3 border rounded-md">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                      <Database className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="text-sm font-medium">
                                      Journalisation (Write-Ahead Logging)
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Les modifications sont d&apos;abord écrites
                                    dans un journal avant d&apos;être appliquées
                                    à la base de données. En cas de panne, le
                                    journal permet de récupérer les transactions
                                    validées.
                                  </div>
                                </div>

                                <div className="p-3 border rounded-md">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="text-sm font-medium">
                                      Points de contrôle (Checkpoints)
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Des points de contrôle sont créés
                                    périodiquement pour synchroniser le journal
                                    et la base de données. Cela réduit le temps
                                    de récupération après une panne.
                                  </div>
                                </div>

                                <div className="p-3 border rounded-md">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                      <Database className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    <div className="text-sm font-medium">
                                      Stockage non volatile
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Les données sont stockées sur des supports
                                    persistants (disques durs, SSD) qui
                                    conservent les informations même en cas de
                                    coupure de courant.
                                  </div>
                                </div>

                                <div className="p-3 border rounded-md">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                      <Database className="h-4 w-4 text-purple-500" />
                                    </div>
                                    <div className="text-sm font-medium">
                                      Réplication
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Les données sont copiées sur plusieurs
                                    serveurs pour assurer leur disponibilité
                                    même en cas de défaillance d&apos;un
                                    serveur.
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Durability Process */}
                            <div className="border rounded-md p-4 bg-card flex flex-col">
                              <div className="text-center mb-4">
                                <h4 className="font-medium text-primary flex items-center justify-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Processus de Validation
                                </h4>
                              </div>

                              <div className="flex-1 flex flex-col justify-center">
                                <div className="space-y-6">
                                  <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium">
                                        1
                                      </div>
                                      <div className="text-sm">
                                        Transaction: Transférer 100€ du compte A
                                        vers B
                                      </div>
                                    </div>
                                    <div className="ml-3 h-6 border-l-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                                  </div>

                                  <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium">
                                        2
                                      </div>
                                      <div className="text-sm">
                                        Écriture dans le journal (WAL)
                                        <div className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                          <code>BEGIN TX #1234</code>
                                          <br />
                                          <code>
                                            UPDATE accounts SET balance =
                                            balance - 100 WHERE id =
                                            &apos;A&apos;
                                          </code>
                                          <br />
                                          <code>
                                            UPDATE accounts SET balance =
                                            balance + 100 WHERE id =
                                            &apos;B&apos;
                                          </code>
                                          <br />
                                          <code>COMMIT TX #1234</code>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="ml-3 h-6 border-l-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                                  </div>

                                  <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-medium">
                                        3
                                      </div>
                                      <div className="text-sm">
                                        Confirmation au client:
                                        &quot;Transaction validée&quot;
                                      </div>
                                    </div>
                                    <div className="ml-3 h-6 border-l-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                                  </div>

                                  <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-medium">
                                        4
                                      </div>
                                      <div className="text-sm">
                                        Panne du système (crash ou coupure de
                                        courant)
                                      </div>
                                    </div>
                                    <div className="ml-3 h-6 border-l-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                                  </div>

                                  <div className="relative">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-medium">
                                        5
                                      </div>
                                      <div className="text-sm">
                                        Redémarrage et récupération à partir du
                                        journal
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                  <div className="text-sm text-green-700 dark:text-green-300">
                                    <span className="font-medium">
                                      Résultat:
                                    </span>{" "}
                                    Après le redémarrage, la transaction est
                                    toujours appliquée. Les 100€ ont bien été
                                    transférés du compte A vers le compte B.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CAP Visualization */}
            {activeVisualization === "cap" && (
              <div className="space-y-4">
                {/* CAP Property Selector */}
                <div className="flex justify-center mb-4">
                  <div className="inline-flex rounded-md border p-1 bg-muted/30">
                    <Button
                      variant={
                        activeCapProperty === "consistency"
                          ? "default"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() => setActiveCapProperty("consistency")}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Cohérence</span>
                    </Button>
                    <Button
                      variant={
                        activeCapProperty === "availability"
                          ? "default"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() => setActiveCapProperty("availability")}
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Disponibilité</span>
                    </Button>
                    <Button
                      variant={
                        activeCapProperty === "partition-tolerance"
                          ? "default"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        setActiveCapProperty("partition-tolerance")
                      }
                      className="flex items-center gap-1"
                    >
                      <SplitSquareVertical className="h-4 w-4" />
                      <span>Tolérance au Partitionnement</span>
                    </Button>
                  </div>
                </div>

                {/* Database Type Selector */}
                <div className="flex justify-center mb-4">
                  <div className="inline-flex rounded-md border p-1 bg-muted/30">
                    <Button
                      variant={databaseType === "cp" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setDatabaseType("cp")}
                      className="flex items-center gap-1"
                    >
                      <span>CP</span>
                    </Button>
                    <Button
                      variant={databaseType === "ap" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setDatabaseType("ap")}
                      className="flex items-center gap-1"
                    >
                      <span>AP</span>
                    </Button>
                    <Button
                      variant={databaseType === "ca" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setDatabaseType("ca")}
                      className="flex items-center gap-1"
                    >
                      <span>CA</span>
                    </Button>
                  </div>
                </div>

                {/* CAP Visualization Canvas */}
                <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
                  <div className="p-4 h-full flex flex-col">
                    {/* CAP Visualization */}
                    <div className="h-full">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                          <SplitSquareVertical className="h-5 w-5 text-primary" />
                          Théorème CAP
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Un système distribué ne peut garantir que deux des
                          trois propriétés à la fois
                        </p>
                      </div>

                      {/* CAP Triangle Visualization */}
                      <div className="relative h-[250px] mb-6">
                        {/* Triangle */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            width="300"
                            height="250"
                            viewBox="0 0 300 250"
                            className="text-muted-foreground"
                          >
                            {/* Triangle outline */}
                            <path
                              d="M150,10 L10,230 L290,230 Z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray={
                                databaseType === "ca" ? "5,5" : "none"
                              }
                            />

                            {/* C-A line */}
                            <path
                              d="M10,230 L290,230"
                              stroke={
                                databaseType === "ca"
                                  ? "#3b82f6"
                                  : "currentColor"
                              }
                              strokeWidth={databaseType === "ca" ? "3" : "2"}
                            />

                            {/* C-P line */}
                            <path
                              d="M150,10 L10,230"
                              stroke={
                                databaseType === "cp"
                                  ? "#3b82f6"
                                  : "currentColor"
                              }
                              strokeWidth={databaseType === "cp" ? "3" : "2"}
                            />

                            {/* A-P line */}
                            <path
                              d="M150,10 L290,230"
                              stroke={
                                databaseType === "ap"
                                  ? "#3b82f6"
                                  : "currentColor"
                              }
                              strokeWidth={databaseType === "ap" ? "3" : "2"}
                            />

                            {/* Consistency node */}
                            <circle
                              cx="150"
                              cy="10"
                              r="30"
                              fill={
                                activeCapProperty === "consistency"
                                  ? "#dbeafe"
                                  : "#f8fafc"
                              }
                              stroke={
                                activeCapProperty === "consistency"
                                  ? "#3b82f6"
                                  : "currentColor"
                              }
                              strokeWidth={
                                activeCapProperty === "consistency" ? "3" : "1"
                              }
                            />

                            {/* Availability node */}
                            <circle
                              cx="10"
                              cy="230"
                              r="30"
                              fill={
                                activeCapProperty === "availability"
                                  ? "#dbeafe"
                                  : "#f8fafc"
                              }
                              stroke={
                                activeCapProperty === "availability"
                                  ? "#3b82f6"
                                  : "currentColor"
                              }
                              strokeWidth={
                                activeCapProperty === "availability" ? "3" : "1"
                              }
                            />

                            {/* Partition Tolerance node */}
                            <circle
                              cx="290"
                              cy="230"
                              r="30"
                              fill={
                                activeCapProperty === "partition-tolerance"
                                  ? "#dbeafe"
                                  : "#f8fafc"
                              }
                              stroke={
                                activeCapProperty === "partition-tolerance"
                                  ? "#3b82f6"
                                  : "currentColor"
                              }
                              strokeWidth={
                                activeCapProperty === "partition-tolerance"
                                  ? "3"
                                  : "1"
                              }
                            />

                            {/* Labels */}
                            <text
                              x="150"
                              y="15"
                              textAnchor="middle"
                              fill="currentColor"
                              className="text-xs font-medium"
                            >
                              C
                            </text>
                            <text
                              x="10"
                              y="235"
                              textAnchor="middle"
                              fill="currentColor"
                              className="text-xs font-medium"
                            >
                              A
                            </text>
                            <text
                              x="290"
                              y="235"
                              textAnchor="middle"
                              fill="currentColor"
                              className="text-xs font-medium"
                            >
                              P
                            </text>
                          </svg>
                        </div>

                        {/* Consistency Label */}
                        <div
                          className="absolute"
                          style={{
                            top: "0",
                            left: "50%",
                            transform: "translateX(-50%)",
                          }}
                        >
                          <div className="flex flex-col items-center mt-16">
                            <div className="text-sm font-medium">Cohérence</div>
                            <div className="text-xs text-muted-foreground text-center max-w-[150px] mt-1">
                              Tous les nœuds voient les mêmes données au même
                              moment
                            </div>
                          </div>
                        </div>

                        {/* Availability Label */}
                        <div
                          className="absolute"
                          style={{ bottom: "0", left: "10%" }}
                        >
                          <div className="flex flex-col items-center mb-16">
                            <div className="text-sm font-medium">
                              Disponibilité
                            </div>
                            <div className="text-xs text-muted-foreground text-center max-w-[150px] mt-1">
                              Chaque requête reçoit une réponse, sans garantie
                              de fraîcheur
                            </div>
                          </div>
                        </div>

                        {/* Partition Tolerance Label */}
                        <div
                          className="absolute"
                          style={{ bottom: "0", right: "10%" }}
                        >
                          <div className="flex flex-col items-center mb-16">
                            <div className="text-sm font-medium">
                              Tolérance au Partitionnement
                            </div>
                            <div className="text-xs text-muted-foreground text-center max-w-[150px] mt-1">
                              Le système continue de fonctionner malgré les
                              pannes réseau
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Database Type Description */}
                      <div className="border rounded-md p-4 bg-card">
                        {databaseType === "cp" && (
                          <div>
                            <h4 className="text-center font-medium mb-3 text-primary">
                              Systèmes CP (Cohérence + Tolérance au
                              Partitionnement)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Caractéristiques
                                </div>
                                <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                                  <li>Privilégie la cohérence des données</li>
                                  <li>
                                    Peut devenir indisponible en cas de
                                    partition réseau
                                  </li>
                                  <li>
                                    Utilise souvent des algorithmes de consensus
                                    (Paxos, Raft)
                                  </li>
                                  <li>
                                    Garantit que les lectures renvoient les
                                    données les plus récentes
                                  </li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Exemples
                                </div>
                                <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                                  <li>
                                    MongoDB (en mode répliqué avec majorité de
                                    lecture/écriture)
                                  </li>
                                  <li>HBase</li>
                                  <li>Redis (avec Sentinel ou Cluster)</li>
                                  <li>etcd, ZooKeeper, Consul</li>
                                  <li>Google Cloud Spanner</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {databaseType === "ap" && (
                          <div>
                            <h4 className="text-center font-medium mb-3 text-primary">
                              Systèmes AP (Disponibilité + Tolérance au
                              Partitionnement)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Caractéristiques
                                </div>
                                <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                                  <li>
                                    Privilégie la disponibilité du service
                                  </li>
                                  <li>
                                    Accepte la cohérence éventuelle des données
                                  </li>
                                  <li>
                                    Continue de fonctionner pendant les
                                    partitions réseau
                                  </li>
                                  <li>
                                    Utilise souvent des mécanismes de
                                    réconciliation (vecteurs d&apos;horloge)
                                  </li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Exemples
                                </div>
                                <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                                  <li>Cassandra</li>
                                  <li>CouchDB</li>
                                  <li>Riak</li>
                                  <li>Amazon DynamoDB</li>
                                  <li>Voldemort</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {databaseType === "ca" && (
                          <div>
                            <h4 className="text-center font-medium mb-3 text-primary">
                              Systèmes CA (Cohérence + Disponibilité)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Caractéristiques
                                </div>
                                <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                                  <li>
                                    Fonctionne uniquement dans un réseau fiable
                                    sans partition
                                  </li>
                                  <li>
                                    Généralement limité à un seul nœud ou un
                                    réseau local
                                  </li>
                                  <li>
                                    Ne peut pas fonctionner de manière
                                    distribuée à grande échelle
                                  </li>
                                  <li className="text-amber-600 dark:text-amber-400 font-medium">
                                    Impossible dans un vrai système distribué
                                  </li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Exemples
                                </div>
                                <ul className="text-xs list-disc pl-5 space-y-1 text-muted-foreground">
                                  <li>
                                    Bases de données relationnelles
                                    traditionnelles (sur un seul nœud)
                                  </li>
                                  <li>
                                    MySQL, PostgreSQL (sans sharding ni
                                    réplication)
                                  </li>
                                  <li>SQLite</li>
                                </ul>
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md mt-2">
                                  <div className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                    <span>
                                      Dans un vrai système distribué, les
                                      partitions réseau sont inévitables, donc
                                      CA n&apos;est pas réalisable.
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Propriétés ACID</h3>
                <p className="text-muted-foreground">
                  ACID est un ensemble de propriétés qui garantissent la
                  fiabilité des transactions dans une base de données. Ces
                  propriétés sont essentielles pour les applications qui
                  nécessitent une intégrité des données stricte.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <Layers className="h-4 w-4 text-primary" />
                    Atomicité (Atomicity)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Une transaction est traitée comme une unité indivisible qui
                    réussit complètement ou échoue complètement. Il n&apos;y a
                    pas d&apos;état intermédiaire.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Cohérence (Consistency)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Une transaction amène la base de données d&apos;un état
                    valide à un autre état valide, en respectant toutes les
                    règles d&apos;intégrité définies.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <Lock className="h-4 w-4 text-primary" />
                    Isolation (Isolation)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Les transactions sont exécutées de manière isolée les unes
                    des autres, comme si elles étaient séquentielles, même si
                    elles sont exécutées en parallèle.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <Database className="h-4 w-4 text-primary" />
                    Durabilité (Durability)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Une fois qu&apos;une transaction est validée, ses effets
                    sont permanents et survivent même en cas de panne système ou
                    de coupure de courant.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Théorème CAP</h3>
                <p className="text-muted-foreground">
                  Le théorème CAP stipule qu&apos;un système de base de données
                  distribuée ne peut garantir simultanément que deux des trois
                  propriétés suivantes : Cohérence, Disponibilité et Tolérance
                  au Partitionnement.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Cohérence (Consistency)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Tous les nœuds voient les mêmes données au même moment.
                    Après une mise à jour, tous les clients voient la même
                    version des données.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    Disponibilité (Availability)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Le système répond à chaque requête, réussie ou non. Chaque
                    nœud non défaillant retourne une réponse raisonnable dans un
                    délai raisonnable.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <SplitSquareVertical className="h-4 w-4 text-primary" />
                    Tolérance au Partitionnement (Partition Tolerance)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Le système continue de fonctionner malgré la perte
                    arbitraire de messages entre les nœuds ou la défaillance
                    d&apos;une partie du réseau.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Comparaison ACID vs BASE
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left border">Critère</th>
                      <th className="p-2 text-left border">ACID</th>
                      <th className="p-2 text-left border">BASE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium">Signification</td>
                      <td className="p-2 border">
                        Atomicité, Cohérence, Isolation, Durabilité
                      </td>
                      <td className="p-2 border">
                        Basically Available, Soft state, Eventually consistent
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Priorité</td>
                      <td className="p-2 border">
                        Cohérence et intégrité des données
                      </td>
                      <td className="p-2 border">
                        Disponibilité et performances
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Cohérence</td>
                      <td className="p-2 border">Forte et immédiate</td>
                      <td className="p-2 border">Éventuelle</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Disponibilité</td>
                      <td className="p-2 border">
                        Peut être limitée pour garantir la cohérence
                      </td>
                      <td className="p-2 border">
                        Haute, même en cas de panne partielle
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">
                        Mise à l&apos;échelle
                      </td>
                      <td className="p-2 border">
                        Plus difficile, souvent verticale
                      </td>
                      <td className="p-2 border">Plus facile, horizontale</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">
                        Cas d&apos;usage
                      </td>
                      <td className="p-2 border">
                        Systèmes financiers, transactions bancaires
                      </td>
                      <td className="p-2 border">
                        Réseaux sociaux, systèmes de recommandation
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Exemples</td>
                      <td className="p-2 border">
                        PostgreSQL, MySQL, SQL Server
                      </td>
                      <td className="p-2 border">
                        Cassandra, DynamoDB, CouchDB
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Niveaux d&apos;Isolation SQL Standard
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium">Read Uncommitted</span> - Le
                      niveau le plus bas. Permet les lectures sales,
                      non-répétables et fantômes.
                    </li>
                    <li>
                      <span className="font-medium">Read Committed</span> -
                      Empêche les lectures sales, mais permet les lectures
                      non-répétables et fantômes.
                    </li>
                    <li>
                      <span className="font-medium">Repeatable Read</span> -
                      Empêche les lectures sales et non-répétables, mais permet
                      les lectures fantômes.
                    </li>
                    <li>
                      <span className="font-medium">Serializable</span> - Le
                      niveau le plus élevé. Empêche tous les problèmes de
                      concurrence.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <h4 className="font-medium text-primary">
                    Modèles de Cohérence dans les Systèmes Distribués
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium">Cohérence forte</span> -
                      Toutes les lectures renvoient la dernière valeur écrite.
                    </li>
                    <li>
                      <span className="font-medium">Cohérence éventuelle</span>{" "}
                      - Les mises à jour se propagent éventuellement à tous les
                      nœuds.
                    </li>
                    <li>
                      <span className="font-medium">Cohérence causale</span> -
                      Les opérations liées causalement sont vues dans le même
                      ordre par tous les nœuds.
                    </li>
                    <li>
                      <span className="font-medium">Cohérence de session</span>{" "}
                      - Un client voit ses propres opérations dans l&apos;ordre,
                      mais pas nécessairement celles des autres.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg border bg-card">
                <h4 className="font-medium mb-3">
                  Compromis et Considérations
                </h4>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Quand choisir ACID?
                    </h5>
                    <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Applications financières ou bancaires</li>
                      <li>Systèmes de réservation</li>
                      <li>
                        Applications nécessitant une forte intégrité des données
                      </li>
                      <li>Systèmes de gestion d&apos;inventaire</li>
                      <li>
                        Applications avec des contraintes réglementaires
                        strictes
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Quand choisir BASE/CAP?
                    </h5>
                    <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Applications à très grande échelle</li>
                      <li>Réseaux sociaux et plateformes de contenu</li>
                      <li>Systèmes d&apos;analyse de données massives</li>
                      <li>Applications où la disponibilité est critique</li>
                      <li>Systèmes géographiquement distribués</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <h5 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">
                      Tendances Modernes
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      De nombreux systèmes modernes adoptent une approche
                      hybride, offrant différents niveaux de garanties selon les
                      besoins. Par exemple, Google Spanner et CockroachDB
                      tentent de combiner la cohérence forte d&apos;ACID avec la
                      mise à l&apos;échelle horizontale des systèmes distribués,
                      tandis que certaines bases NoSQL offrent des options de
                      cohérence ajustables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
