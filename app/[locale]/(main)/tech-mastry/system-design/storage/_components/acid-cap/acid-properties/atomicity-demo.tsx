"use client";

import { CheckCircle, Layers, XCircle } from "lucide-react";

export function AtomicityDemo() {
  return (
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
            <h4 className="font-medium text-green-400 flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Transaction Réussie
            </h4>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-900/30 flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <div className="text-sm">
                    Débit du compte A: 100€
                  </div>
                </div>
                <div className="ml-3 h-6 border-l-2 border-dashed border-slate-600"></div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-900/30 flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <div className="text-sm">
                    Crédit du compte B: 100€
                  </div>
                </div>
                <div className="ml-3 h-6 border-l-2 border-dashed border-slate-600"></div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-900/30 flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <div className="text-sm font-medium text-green-400">
                    COMMIT
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-green-900/20 border border-green-800 rounded-md">
              <div className="text-sm text-green-300">
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
            <h4 className="font-medium text-red-400 flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4" />
              Transaction Échouée
            </h4>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-900/30 flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <div className="text-sm">
                    Débit du compte A: 100€
                  </div>
                </div>
                <div className="ml-3 h-6 border-l-2 border-dashed border-slate-600"></div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-red-900/30 flex items-center justify-center text-xs font-medium">
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
                <div className="ml-3 h-6 border-l-2 border-dashed border-slate-600"></div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-900/30 flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <div className="text-sm font-medium text-red-400">
                    ROLLBACK
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-red-900/20 border border-red-800 rounded-md">
              <div className="text-sm text-red-300">
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
  );
}
