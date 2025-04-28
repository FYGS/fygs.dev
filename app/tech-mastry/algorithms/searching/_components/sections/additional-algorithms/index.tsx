"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExponentialSearch } from "./exponential-search";
import { TernarySearch } from "./ternary-search";

type AlgorithmType = "exponential" | "ternary";

export function AdditionalAlgorithms() {
  const [activeAlgorithm, setActiveAlgorithm] = useState<AlgorithmType>("exponential");
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Algorithmes de Recherche Avancés</h2>
        <p className="text-muted-foreground">
          Explorez d&apos;autres algorithmes de recherche plus avancés et leurs applications.
        </p>
      </div>
      
      <Tabs value={activeAlgorithm} onValueChange={(value) => setActiveAlgorithm(value as AlgorithmType)} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="exponential">Recherche Exponentielle</TabsTrigger>
          <TabsTrigger value="ternary">Recherche Ternaire</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exponential" className="mt-6">
          <ExponentialSearch />
        </TabsContent>
        
        <TabsContent value="ternary" className="mt-6">
          <TernarySearch />
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted/30 p-6 rounded-lg space-y-4">
        <h3 className="text-xl font-medium">Comparaison des Algorithmes Avancés</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-medium">Recherche Exponentielle</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span><strong>Complexité:</strong> O(log i) où i est la position de l&apos;élément recherché</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span><strong>Avantages:</strong> Plus efficace que la recherche binaire lorsque l&apos;élément est proche du début</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span><strong>Inconvénients:</strong> Nécessite un tableau trié et peut être moins efficace pour les éléments éloignés du début</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span><strong>Cas d&apos;utilisation:</strong> Recherche dans des tableaux triés de grande taille où les éléments recherchés sont souvent proches du début</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-lg font-medium">Recherche Ternaire</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span><strong>Complexité:</strong> O(log₃ n), légèrement meilleure que la recherche binaire en théorie</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span><strong>Avantages:</strong> Moins d&apos;itérations que la recherche binaire</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span><strong>Inconvénients:</strong> Plus de comparaisons par itération, ce qui peut annuler l&apos;avantage théorique</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span><strong>Cas d&apos;utilisation:</strong> Recherche dans des tableaux triés où le coût des comparaisons est faible par rapport au coût des itérations</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-lg font-medium mb-3">Quand utiliser ces algorithmes ?</h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Recherche Exponentielle:</strong> Particulièrement utile pour les tableaux non bornés ou de taille inconnue, où l&apos;on ne connaît pas la taille maximale à l&apos;avance. Elle est également efficace lorsque l&apos;élément recherché est susceptible d&apos;être proche du début du tableau.
            </p>
            <p>
              <strong>Recherche Ternaire:</strong> Bien que théoriquement plus efficace que la recherche binaire, elle est rarement utilisée en pratique car les deux comparaisons supplémentaires par itération annulent souvent l&apos;avantage du nombre réduit d&apos;itérations. Elle peut être utile dans des cas spécifiques où le coût des itérations est beaucoup plus élevé que celui des comparaisons.
            </p>
            <p>
              En pratique, la recherche binaire reste l&apos;algorithme de recherche le plus utilisé pour les tableaux triés en raison de sa simplicité et de son efficacité. Les algorithmes avancés comme la recherche exponentielle et ternaire sont utilisés dans des cas spécifiques où leurs caractéristiques particulières offrent un avantage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
