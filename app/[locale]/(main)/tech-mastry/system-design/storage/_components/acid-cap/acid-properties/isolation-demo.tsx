"use client";

import { AlertTriangle, CheckCircle, Lock, XCircle } from "lucide-react";

export function IsolationDemo() {
  return (
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
              <div className="text-sm font-medium mb-2 text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Lecture Sale (Dirty Read)
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Une transaction lit des données qui
                n&apos;ont pas encore été validées par une
                autre transaction.
              </div>
              <div className="p-2 bg-slate-800 rounded text-xs">
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
              <div className="text-sm font-medium mb-2 text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Lecture Non-Répétable
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Une transaction relit des données
                qu&apos;elle a déjà lues et trouve que les
                données ont été modifiées.
              </div>
              <div className="p-2 bg-slate-800 rounded text-xs">
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
              <div className="text-sm font-medium mb-2 text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Lecture Fantôme
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Une transaction relit un ensemble de lignes
                qui satisfont une condition et trouve que de
                nouvelles lignes ont été ajoutées.
              </div>
              <div className="p-2 bg-slate-800 rounded text-xs">
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
              <div className="text-sm font-medium mb-2 text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Mise à Jour Perdue
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Deux transactions lisent et mettent à jour
                la même donnée, et l&apos;une écrase les
                modifications de l&apos;autre.
              </div>
              <div className="p-2 bg-slate-800 rounded text-xs">
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
  );
}
