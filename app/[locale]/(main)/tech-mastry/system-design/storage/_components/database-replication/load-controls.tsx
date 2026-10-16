"use client";

import { Slider } from "@/components/ui/slider";

interface LoadControlsProps {
  writeLoad: number;
  setWriteLoad: (value: number) => void;
  readLoad: number;
  setReadLoad: (value: number) => void;
}

export function LoadControls({
  writeLoad,
  setWriteLoad,
  readLoad,
  setReadLoad,
}: LoadControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Charge d&apos;écriture</span>
          <span className="font-medium">{writeLoad}%</span>
        </div>
        <Slider
          value={[writeLoad]}
          min={10}
          max={90}
          step={10}
          onValueChange={(value) => setWriteLoad(value[0])}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Charge de lecture</span>
          <span className="font-medium">{readLoad}%</span>
        </div>
        <Slider
          value={[readLoad]}
          min={10}
          max={90}
          step={10}
          onValueChange={(value) => setReadLoad(value[0])}
        />
      </div>
    </div>
  );
}
