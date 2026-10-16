"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  Database,
  Eye,
  Globe,
  HardDrive,
  LayoutDashboard,
  Link,
  Monitor,
  Move,
  Server,
  Settings,
  Trash2,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { ComponentType, DiagramComponent } from "./types";

interface ToolPaletteProps {
  tool: "select" | "pan" | "connect";
  setTool: (tool: "select" | "pan" | "connect") => void;
  addComponent: (type: ComponentType) => void;
  selectedComponent: string | null;
  components: DiagramComponent[];
  setComponents: Dispatch<SetStateAction<DiagramComponent[]>>;
  deleteSelectedComponent: () => void;
}

export function ToolPalette({
  tool,
  setTool,
  addComponent,
  selectedComponent,
  components,
  setComponents,
  deleteSelectedComponent,
}: ToolPaletteProps) {
  return (
    <div className="w-64 space-y-4">
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          Tools
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={tool === "select" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("select")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <Move className="h-4 w-4" />
            <span className="text-xs">Select</span>
          </Button>
          <Button
            variant={tool === "pan" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("pan")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <Eye className="h-4 w-4" />
            <span className="text-xs">Pan</span>
          </Button>
          <Button
            variant={tool === "connect" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("connect")}
            className="flex flex-col items-center gap-1 py-2"
            disabled
          >
            <Link className="h-4 w-4" />
            <span className="text-xs">Connect</span>
          </Button>
        </div>
      </div>
      
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-primary" />
          Components
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addComponent("client")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <Monitor className="h-4 w-4" />
            <span className="text-xs">Client</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addComponent("server")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <Server className="h-4 w-4" />
            <span className="text-xs">Server</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addComponent("database")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <Database className="h-4 w-4" />
            <span className="text-xs">DB</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addComponent("api")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs">API</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addComponent("cache")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <HardDrive className="h-4 w-4" />
            <span className="text-xs">Cache</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addComponent("loadBalancer")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <Activity className="h-4 w-4" />
            <span className="text-xs">LB</span>
          </Button>
        </div>
      </div>
      
      {selectedComponent && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Properties
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="component-name" className="text-xs">Name</Label>
              <Input
                id="component-name"
                value={components.find(c => c.id === selectedComponent)?.name || ""}
                onChange={(e) => {
                  setComponents(prev => 
                    prev.map(comp => 
                      comp.id === selectedComponent 
                        ? { ...comp, name: e.target.value } 
                        : comp
                    )
                  );
                }}
                className="text-sm mt-1"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={deleteSelectedComponent}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
