"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, LayoutDashboard, Minus, Plus, RotateCcw } from "lucide-react";
import { DiagramCanvas } from "./architecture-diagramming-tool/diagram-canvas";
import { DocumentationCard } from "./architecture-diagramming-tool/documentation-card";
import {
  initialComponents,
  initialConnections,
} from "./architecture-diagramming-tool/data";
import {
  clampZoom,
  createComponent,
  getDragOffset,
  getDraggedPosition,
} from "./architecture-diagramming-tool/lib";
import { TemplatesCard } from "./architecture-diagramming-tool/templates-card";
import { ToolPalette } from "./architecture-diagramming-tool/tool-palette";
import type {
  ComponentType,
  Connection,
  DiagramComponent,
  SystemDesignTemplate,
} from "./architecture-diagramming-tool/types";

export function ArchitectureDiagrammingTool() {
  const [activeTab, setActiveTab] = useState("diagram");
  const [components, setComponents] = useState<DiagramComponent[]>(initialComponents);

  const [connections, setConnections] = useState<Connection[]>(initialConnections);

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<"select" | "pan" | "connect">("select");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle mouse down on component
  const handleComponentMouseDown = (e: React.MouseEvent, id: string) => {
    if (tool !== "select") return;
    
    e.stopPropagation();
    const component = components.find(c => c.id === id);
    if (component && !component.locked) {
      setSelectedComponent(id);
      setDraggingComponent(id);
      
      const canvasRect = canvasRef.current?.getBoundingClientRect();

      if (canvasRect) {
        setDragOffset(
          getDragOffset(
            { x: e.clientX, y: e.clientY },
            canvasRect,
            component,
            zoom,
            pan
          )
        );
      }
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingComponent) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const { x: newX, y: newY } = getDraggedPosition(
          { x: e.clientX, y: e.clientY },
          canvasRect,
          dragOffset,
          zoom,
          pan
        );

        setComponents(prev =>
          prev.map(comp =>
            comp.id === draggingComponent
              ? { ...comp, x: newX, y: newY }
              : comp
          )
        );
      }
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggingComponent(null);
    setIsPanning(false);
  };

  // Handle canvas mouse down for panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (tool === "pan" && e.target === e.currentTarget) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (tool === "select" && e.target === e.currentTarget) {
      setSelectedComponent(null);
    }
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    setZoom(prev => clampZoom(prev, delta));
  };

  // Add a new component
  const addComponent = (type: ComponentType) => {
    const newComponent: DiagramComponent = createComponent(type, components);

    setComponents(prev => [...prev, newComponent]);
  };

  // Delete selected component
  const deleteSelectedComponent = () => {
    if (selectedComponent) {
      setComponents(prev => prev.filter(c => c.id !== selectedComponent));
      setConnections(prev => 
        prev.filter(conn => 
          conn.sourceId !== selectedComponent && conn.targetId !== selectedComponent
        )
      );
      setSelectedComponent(null);
    }
  };

  // Apply template
  const applyTemplate = (template: SystemDesignTemplate) => {
    setComponents(template.components);
    setConnections(template.connections);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Architecture Studio</h1>
        <p className="text-muted-foreground mt-2">
          Concevez et visualisez des architectures système avec nos outils de diagramme interactifs
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto">
          <TabsTrigger value="diagram" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Diagramme
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Modèles
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagram" className="space-y-6">
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <span>Canevas d&apos;architecture</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleZoom(0.1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleZoom(-0.1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoom(1)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
                </div>
              </CardTitle>
              <CardDescription>
                Glissez-déposez les composants pour concevoir l&apos;architecture de votre système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                {/* Component Palette */}
                <ToolPalette
                  tool={tool}
                  setTool={setTool}
                  addComponent={addComponent}
                  selectedComponent={selectedComponent}
                  components={components}
                  setComponents={setComponents}
                  deleteSelectedComponent={deleteSelectedComponent}
                />

                {/* Canvas Area */}
                <DiagramCanvas
                  canvasRef={canvasRef}
                  components={components}
                  connections={connections}
                  selectedComponent={selectedComponent}
                  pan={pan}
                  zoom={zoom}
                  handleCanvasMouseDown={handleCanvasMouseDown}
                  handleMouseMove={handleMouseMove}
                  handleMouseUp={handleMouseUp}
                  handleComponentMouseDown={handleComponentMouseDown}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplatesCard applyTemplate={applyTemplate} />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <DocumentationCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
