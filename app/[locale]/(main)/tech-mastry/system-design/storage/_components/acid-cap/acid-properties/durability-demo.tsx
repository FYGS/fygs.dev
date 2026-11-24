"use client";

import { CheckCircle, Clock, Database } from "lucide-react";

export function DurabilityDemo() {
  return (
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
                <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
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
                <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
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
                <div className="w-8 h-8 rounded-full bg-indigo-900/30 flex items-center justify-center">
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
                <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
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
                  <div className="w-6 h-6 rounded-full bg-blue-900/30 flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <div className="text-sm">
                    Transaction: Transférer 100€ du compte A
                    vers B
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
                    Écriture dans le journal (WAL)
                    <div className="mt-1 p-2 bg-slate-800 rounded text-xs">
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
                <div className="ml-3 h-6 border-l-2 border-dashed border-slate-600"></div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-900/30 flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <div className="text-sm">
                    Confirmation au client:
                    &quot;Transaction validée&quot;
                  </div>
                </div>
                <div className="ml-3 h-6 border-l-2 border-dashed border-slate-600"></div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-red-900/30 flex items-center justify-center text-xs font-medium">
                    4
                  </div>
                  <div className="text-sm">
                    Panne du système (crash ou coupure de
                    courant)
                  </div>
                </div>
                <div className="ml-3 h-6 border-l-2 border-dashed border-slate-600"></div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-900/30 flex items-center justify-center text-xs font-medium">
                    5
                  </div>
                  <div className="text-sm">
                    Redémarrage et récupération à partir du
                    journal
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-green-900/20 border border-green-800 rounded-md">
              <div className="text-sm text-green-300">
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
  );
}
