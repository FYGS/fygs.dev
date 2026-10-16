"use client";

import { motion } from "framer-motion";

import type { HashTableBucket, HashTableEntry, HashTableStep } from "./types";

interface BucketListProps {
  currentStep: HashTableStep;
}

export function BucketList({ currentStep }: BucketListProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-h-[400px] overflow-y-auto">
        {currentStep.buckets.map((bucket: HashTableBucket) => {
          const isActiveBucket = currentStep.activeIndices.includes(
            bucket.index
          );

          return (
            <div key={bucket.index} className="mb-2">
              <div className="flex items-center mb-1">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-md mr-2 ${
                          isActiveBucket
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100"
                        }`}
                >
                  {bucket.index}
                </div>
                <div
                  className={`flex-1 h-12 border-2 rounded-md flex items-center px-2 ${
                          isActiveBucket ? "border-blue-500" : "border-gray-300"
                        }`}
                >
                  {bucket.entries.length === 0 ? (
                    <span className="text-gray-400 text-sm">
                      Bucket vide
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {bucket.entries.map((entry: HashTableEntry) => {
                        const isActiveEntry =
                          currentStep.activeEntries.includes(entry.id);
                        const isTarget =
                          currentStep.targetKey === entry.key;

                        // Déterminer les couleurs en fonction de l'opération et de l'état
                        let borderColor = "border-gray-300";
                        let bgColor = "bg-gray-50";
                        let textColor = "text-gray-700";

                        if (isActiveEntry && isTarget) {
                          // Élément actif et cible (trouvé)
                          switch (currentStep.operation) {
                            case "get":
                              borderColor = "border-green-500";
                              bgColor = "bg-green-100";
                              textColor = "text-green-700";
                              break;
                            case "remove":
                              borderColor = "border-rose-500";
                              bgColor = "bg-rose-100";
                              textColor = "text-rose-700";
                              break;
                            default:
                              borderColor = "border-purple-500";
                              bgColor = "bg-purple-100";
                              textColor = "text-purple-700";
                          }
                        } else if (isActiveEntry) {
                          // Élément actif (en cours d'examen)
                          borderColor = "border-amber-500";
                          bgColor = "bg-amber-100";
                          textColor = "text-amber-700";
                        } else if (isTarget && !currentStep.found) {
                          // Cible recherchée mais pas encore trouvée
                          borderColor = "border-purple-500";
                          bgColor = "bg-purple-100/50";
                          textColor = "text-purple-700";
                        }

                        return (
                          <motion.div
                            key={entry.id}
                            className={`px-2 py-1 rounded border ${borderColor} ${bgColor} ${textColor} text-sm flex items-center`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                              scale: isActiveEntry ? 1.05 : 1,
                              opacity: 1,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <span className="font-medium">
                              {entry.key}
                            </span>
                            <span className="mx-1">:</span>
                            <span>{entry.value}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
