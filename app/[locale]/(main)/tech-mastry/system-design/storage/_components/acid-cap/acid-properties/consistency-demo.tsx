"use client";

import { CheckCircle, XCircle } from "lucide-react";

export function ConsistencyDemo() {
  return (
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
            <h4 className="font-medium text-green-400 flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Transaction Valide
            </h4>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-md">
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
                  <div className="p-2 bg-slate-800 rounded">
                    <div className="font-medium">
                      Compte A
                    </div>
                    <div>Solde: 500€</div>
                  </div>
                  <div className="p-2 bg-slate-800 rounded">
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
                <div className="text-xs p-2 bg-slate-800 rounded">
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
                  <div className="p-2 bg-slate-800 rounded">
                    <div className="font-medium">
                      Compte A
                    </div>
                    <div>Solde: 200€</div>
                  </div>
                  <div className="p-2 bg-slate-800 rounded">
                    <div className="font-medium">
                      Compte B
                    </div>
                    <div>Solde: 500€</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-3 bg-green-900/20 border border-green-800 rounded-md">
              <div className="text-sm text-green-300">
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
            <h4 className="font-medium text-red-400 flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4" />
              Transaction Invalide
            </h4>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-md">
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
                  <div className="p-2 bg-slate-800 rounded">
                    <div className="font-medium">
                      Compte A
                    </div>
                    <div>Solde: 200€</div>
                  </div>
                  <div className="p-2 bg-slate-800 rounded">
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
                <div className="text-xs p-2 bg-slate-800 rounded">
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
                  <div className="p-2 bg-red-900/20 border border-red-800 rounded">
                    <div className="font-medium">
                      Compte A
                    </div>
                    <div className="text-red-400">
                      Solde: -100€
                    </div>
                  </div>
                  <div className="p-2 bg-slate-800 rounded">
                    <div className="font-medium">
                      Compte B
                    </div>
                    <div>Solde: 400€</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-3 bg-red-900/20 border border-red-800 rounded-md">
              <div className="text-sm text-red-300">
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
  );
}
