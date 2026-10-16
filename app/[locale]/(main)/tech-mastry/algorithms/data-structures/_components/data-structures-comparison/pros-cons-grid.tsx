"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

import { dataStructures } from "./data";
import type { DataStructureType } from "./types";

interface ProsConsGridProps {
  selectedStructures: DataStructureType[];
}

export function ProsConsGrid({ selectedStructures }: ProsConsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {selectedStructures.map((type) => (
        <Card key={type} className="overflow-hidden">
          <CardHeader className="bg-muted py-3">
            <CardTitle className="text-lg">
              {dataStructures[type].name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-600">
                  Avantages:
                </h4>
                <ul className="space-y-1">
                  {dataStructures[type].advantages.map((adv, index) => (
                    <li
                      key={index}
                      className="text-sm flex items-start gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-red-600">
                  Inconvénients:
                </h4>
                <ul className="space-y-1">
                  {dataStructures[type].disadvantages.map(
                    (disadv, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-start gap-2"
                      >
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>{disadv}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
