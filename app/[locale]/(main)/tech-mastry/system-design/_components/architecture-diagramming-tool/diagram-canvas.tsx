"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { MouseEvent, RefObject } from "react";
import { getComponentIcon } from "./component-icon";
import { getComponentColor } from "./lib";
import type { Connection, DiagramComponent } from "./types";

interface DiagramCanvasProps {
  canvasRef: RefObject<HTMLDivElement | null>;
  components: DiagramComponent[];
  connections: Connection[];
  selectedComponent: string | null;
  pan: { x: number; y: number };
  zoom: number;
  handleCanvasMouseDown: (e: MouseEvent) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
  handleComponentMouseDown: (e: MouseEvent, id: string) => void;
}

export function DiagramCanvas({
  canvasRef,
  components,
  connections,
  selectedComponent,
  pan,
  zoom,
  handleCanvasMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleComponentMouseDown,
}: DiagramCanvasProps) {
  return (
    <div 
      ref={canvasRef}
      className="flex-1 border border-border/50 rounded-lg bg-grid-pattern bg-[length:40px_40px] min-h-[500px] relative overflow-hidden"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Render connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((conn) => {
            const sourceComp = components.find(c => c.id === conn.sourceId);
            const targetComp = components.find(c => c.id === conn.targetId);
            
            if (!sourceComp || !targetComp || !sourceComp.visible || !targetComp.visible) return null;
            
            const sourceX = sourceComp.x + sourceComp.width / 2;
            const sourceY = sourceComp.y + sourceComp.height / 2;
            const targetX = targetComp.x + targetComp.width / 2;
            const targetY = targetComp.y + targetComp.height / 2;
            
            return (
              <line
                key={conn.id}
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity="0.5"
                className="text-muted-foreground"
              />
            );
          })}
        </svg>
        
        {/* Render components */}
        {components.map((comp) => (
          <motion.div
            key={comp.id}
            className={cn(
              "absolute border rounded-lg p-3 flex items-center gap-2 cursor-move select-none",
              getComponentColor(comp.type),
              selectedComponent === comp.id && "ring-2 ring-primary/50",
              !comp.visible && "opacity-50"
            )}
            style={{
              left: comp.x,
              top: comp.y,
              width: comp.width,
              height: comp.height,
            }}
            onMouseDown={(e) => handleComponentMouseDown(e, comp.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-1">
              {getComponentIcon(comp.type)}
              <span className="text-xs font-medium truncate">{comp.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
