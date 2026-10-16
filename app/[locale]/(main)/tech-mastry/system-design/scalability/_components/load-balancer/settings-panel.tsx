"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";

interface SettingsPanelProps {
  serverCount: number;
  requestRate: number;
  failureRate: number;
  processingSpeed: number;
  onServerCountChange: (value: number) => void;
  onRequestRateChange: (value: number) => void;
  onFailureRateChange: (value: number) => void;
  onProcessingSpeedChange: (value: number) => void;
  onBack: () => void;
}

export function SettingsPanel({
  serverCount,
  requestRate,
  failureRate,
  processingSpeed,
  onServerCountChange,
  onRequestRateChange,
  onFailureRateChange,
  onProcessingSpeedChange,
  onBack,
}: SettingsPanelProps) {
  return (
    <>
          <div className="grid gap-6">
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="8"
                          rx="2"
                          ry="2"
                        />
                        <rect
                          x="2"
                          y="14"
                          width="20"
                          height="8"
                          rx="2"
                          ry="2"
                        />
                        <line x1="6" y1="6" x2="6.01" y2="6" />
                        <line x1="6" y1="18" x2="6.01" y2="18" />
                      </svg>
                    </div>
                    Nombre de Serveurs
                  </label>
                  <span className="text-sm font-semibold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-500">
                    {serverCount}
                  </span>
                </div>
                <Slider
                  value={[serverCount]}
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={(value) => onServerCountChange(value[0])}
                  className="py-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-500/10 to-cyan-500/10 text-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </div>
                    Taux de Requêtes (par seconde)
                  </label>
                  <span className="text-sm font-semibold px-2 py-1 rounded-md bg-blue-500/10 text-blue-500">
                    {requestRate}
                  </span>
                </div>
                <Slider
                  value={[requestRate]}
                  min={0.5}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => onRequestRateChange(value[0])}
                  className="py-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-red-500/20 bg-background/60 backdrop-blur-xs hover:shadow-md hover:shadow-red-500/10 transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-linear-to-br from-red-500/10 to-rose-500/10 text-red-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    Taux d&apos;Échec (%)
                  </label>
                  <span className="text-sm font-semibold px-2 py-1 rounded-md bg-red-500/10 text-red-500">
                    {failureRate}%
                  </span>
                </div>
                <Slider
                  value={[failureRate]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={(value) => onFailureRateChange(value[0])}
                  className="py-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Vitesse de Traitement
                </label>
                <span className="text-sm text-muted-foreground">
                  {processingSpeed}x
                </span>
              </div>
              <Slider
                value={[processingSpeed]}
                min={0.5}
                max={3}
                step={0.5}
                onValueChange={(value) => onProcessingSpeedChange(value[0])}
              />
            </div>
          </div>

          <div className="p-6 rounded-xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/5 via-background/80 to-purple-500/5 backdrop-blur-xs shadow-inner">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 mt-0.5">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-indigo-500 mb-2">
                  Paramètres de Simulation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ajustez les paramètres ci-dessus pour voir comment
                  différentes configurations affectent la performance du
                  système. Augmentez le nombre de serveurs pour gérer plus de
                  trafic, ou augmentez le taux d&apos;échec pour simuler des
                  conditions de réseau instables.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => onBack()}
              className="bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Retour à la Visualisation
            </Button>
          </div>
    </>
  );
}
