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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Database,
  Server,
  Cloud,
  Network,
  Zap,
  Lock,
  Globe,
  GitBranch,
  Monitor,
  Shield,
  HardDrive,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  RotateCcw,
  Eye,
  LayoutDashboard,
  Activity,
  Move,
  Minus,
  Link,
  FileText,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ComponentType = 
  | "database" 
  | "server" 
  | "client" 
  | "api" 
  | "cache" 
  | "loadBalancer" 
  | "cdn" 
  | "queue" 
  | "messageBroker"
  | "microservice";

interface DiagramComponent {
  id: string;
  type: ComponentType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connections: string[]; // IDs of connected components
  visible: boolean;
  locked: boolean;
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: "direct" | "bidirectional" | "message";
  visible: boolean;
}

interface SystemDesignTemplate {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  components: DiagramComponent[];
  connections: Connection[];
}

export function ArchitectureDiagrammingTool() {
  const [activeTab, setActiveTab] = useState("diagram");
  const [components, setComponents] = useState<DiagramComponent[]>([
    {
      id: "1",
      type: "client",
      name: "Web Client",
      x: 50,
      y: 50,
      width: 120,
      height: 60,
      connections: ["2"],
      visible: true,
      locked: false,
    },
    {
      id: "2",
      type: "api",
      name: "API Gateway",
      x: 250,
      y: 50,
      width: 120,
      height: 60,
      connections: ["3"],
      visible: true,
      locked: false,
    },
    {
      id: "3",
      type: "server",
      name: "Application Server",
      x: 250,
      y: 150,
      width: 120,
      height: 60,
      connections: ["4"],
      visible: true,
      locked: false,
    },
    {
      id: "4",
      type: "database",
      name: "Database",
      x: 450,
      y: 150,
      width: 120,
      height: 60,
      connections: [],
      visible: true,
      locked: false,
    },
  ]);
  
  const [connections, setConnections] = useState<Connection[]>([
    { id: "conn-1", sourceId: "1", targetId: "2", type: "direct", visible: true },
    { id: "conn-2", sourceId: "2", targetId: "3", type: "direct", visible: true },
    { id: "conn-3", sourceId: "3", targetId: "4", type: "direct", visible: true },
  ]);
  
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<"select" | "pan" | "connect">("select");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Templates for common system designs
  const templates: SystemDesignTemplate[] = [
    {
      id: "basic-web-app",
      title: "Basic Web Application",
      description: "Simple client-server architecture with database",
      thumbnail: "web-app",
      components: [
        {
          id: "1",
          type: "client",
          name: "Browser",
          x: 100,
          y: 100,
          width: 120,
          height: 60,
          connections: ["2"],
          visible: true,
          locked: false,
        },
        {
          id: "2",
          type: "server",
          name: "Web Server",
          x: 350,
          y: 100,
          width: 120,
          height: 60,
          connections: ["3"],
          visible: true,
          locked: false,
        },
        {
          id: "3",
          type: "database",
          name: "Database",
          x: 350,
          y: 200,
          width: 120,
          height: 60,
          connections: [],
          visible: true,
          locked: false,
        },
      ],
      connections: [
        { id: "conn-1", sourceId: "1", targetId: "2", type: "direct", visible: true },
        { id: "conn-2", sourceId: "2", targetId: "3", type: "direct", visible: true },
      ],
    },
    {
      id: "microservices",
      title: "Microservices Architecture",
      description: "Distributed services with API gateway and load balancer",
      thumbnail: "microservices",
      components: [
        {
          id: "1",
          type: "client",
          name: "Client",
          x: 50,
          y: 50,
          width: 120,
          height: 60,
          connections: ["2"],
          visible: true,
          locked: false,
        },
        {
          id: "2",
          type: "api",
          name: "API Gateway",
          x: 250,
          y: 50,
          width: 120,
          height: 60,
          connections: ["3", "4", "5"],
          visible: true,
          locked: false,
        },
        {
          id: "3",
          type: "server",
          name: "Auth Service",
          x: 150,
          y: 150,
          width: 120,
          height: 60,
          connections: [],
          visible: true,
          locked: false,
        },
        {
          id: "4",
          type: "server",
          name: "User Service",
          x: 350,
          y: 150,
          width: 120,
          height: 60,
          connections: [],
          visible: true,
          locked: false,
        },
        {
          id: "5",
          type: "server",
          name: "Order Service",
          x: 550,
          y: 150,
          width: 120,
          height: 60,
          connections: [],
          visible: true,
          locked: false,
        },
        {
          id: "6",
          type: "database",
          name: "Auth DB",
          x: 150,
          y: 250,
          width: 120,
          height: 60,
          connections: [],
          visible: true,
          locked: false,
        },
        {
          id: "7",
          type: "database",
          name: "User DB",
          x: 350,
          y: 250,
          width: 120,
          height: 60,
          connections: [],
          visible: true,
          locked: false,
        },
        {
          id: "8",
          type: "database",
          name: "Order DB",
          x: 550,
          y: 250,
          width: 120,
          height: 60,
          connections: [],
          visible: true,
          locked: false,
        },
      ],
      connections: [
        { id: "conn-1", sourceId: "1", targetId: "2", type: "direct", visible: true },
        { id: "conn-2", sourceId: "2", targetId: "3", type: "direct", visible: true },
        { id: "conn-3", sourceId: "2", targetId: "4", type: "direct", visible: true },
        { id: "conn-4", sourceId: "2", targetId: "5", type: "direct", visible: true },
        { id: "conn-5", sourceId: "3", targetId: "6", type: "direct", visible: true },
        { id: "conn-6", sourceId: "4", targetId: "7", type: "direct", visible: true },
        { id: "conn-7", sourceId: "5", targetId: "8", type: "direct", visible: true },
      ],
    },
    {
      id: "scalable-web-app",
      title: "Scalable Web Application",
      description: "High-traffic application with caching, CDNs, and load balancers",
      thumbnail: "scalable",
      components: [
        {
          id: "1",
          type: "client",
          name: "Users",
          x: 50,
          y: 50,
          width: 120,
          height: 60,
          connections: ["2"],
          visible: true,
          locked: false,
        },
        {
          id: "2",
          type: "loadBalancer",
          name: "Load Balancer",
          x: 250,
          y: 50,
          width: 120,
          height: 60,
          connections: ["3", "4"],
          visible: true,
          locked: false,
        },
        {
          id: "3",
          type: "server",
          name: "App Server 1",
          x: 150,
          y: 150,
          width: 120,
          height: 60,
          connections: ["5", "6"],
          visible: true,
          locked: false,
        },
        {
          id: "4",
          type: "server",
          name: "App Server 2",
          x: 350,
          y: 150,
          width: 120,
          height: 60,
          connections: ["5", "6"],
          visible: true,
          locked: false,
        },
        {
          id: "5",
          type: "cache",
          name: "Redis Cache",
          x: 250,
          y: 250,
          width: 120,
          height: 60,
          connections: ["6"],
          visible: true,
          locked: false,
        },
        {
          id: "6",
          type: "database",
          name: "Master DB",
          x: 250,
          y: 350,
          width: 120,
          height: 60,
          connections: ["7"],
          visible: true,
          locked: false,
        },
        {
          id: "7",
          type: "database",
          name: "Read Replica",
          x: 400,
          y: 350,
          width: 120,
          height: 60,
          connections: [],
          visible: true,
          locked: false,
        },
        {
          id: "8",
          type: "cdn",
          name: "CDN",
          x: 450,
          y: 50,
          width: 120,
          height: 60,
          connections: ["9"],
          visible: true,
          locked: false,
        },
        {
          id: "9",
          type: "server",
          name: "Static Assets",
          x: 600,
          y: 50,
          width: 120,
          height: 60,
          connections: [],
          visible: true,
          locked: false,
        },
      ],
      connections: [
        { id: "conn-1", sourceId: "1", targetId: "2", type: "direct", visible: true },
        { id: "conn-2", sourceId: "1", targetId: "8", type: "direct", visible: true },
        { id: "conn-3", sourceId: "2", targetId: "3", type: "direct", visible: true },
        { id: "conn-4", sourceId: "2", targetId: "4", type: "direct", visible: true },
        { id: "conn-5", sourceId: "3", targetId: "5", type: "direct", visible: true },
        { id: "conn-6", sourceId: "4", targetId: "5", type: "direct", visible: true },
        { id: "conn-7", sourceId: "3", targetId: "6", type: "direct", visible: true },
        { id: "conn-8", sourceId: "4", targetId: "6", type: "direct", visible: true },
        { id: "conn-9", sourceId: "5", targetId: "6", type: "direct", visible: true },
        { id: "conn-10", sourceId: "6", targetId: "7", type: "direct", visible: true },
        { id: "conn-11", sourceId: "8", targetId: "9", type: "direct", visible: true },
      ],
    },
  ];

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
        setDragOffset({
          x: e.clientX - canvasRect.left - component.x * zoom - pan.x,
          y: e.clientY - canvasRect.top - component.y * zoom - pan.y
        });
      }
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingComponent) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const newX = (e.clientX - canvasRect.left - dragOffset.x - pan.x) / zoom;
        const newY = (e.clientY - canvasRect.top - dragOffset.y - pan.y) / zoom;
        
        setComponents(prev => 
          prev.map(comp => 
            comp.id === draggingComponent 
              ? { ...comp, x: Math.max(0, newX), y: Math.max(0, newY) } 
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
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2));
  };

  // Add a new component
  const addComponent = (type: ComponentType) => {
    const newComponent: DiagramComponent = {
      id: `comp-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${components.filter(c => c.type === type).length + 1}`,
      x: Math.random() * 600,
      y: Math.random() * 400,
      width: 120,
      height: 60,
      connections: [],
      visible: true,
      locked: false,
    };
    
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

  // Get icon for component type
  const getComponentIcon = (type: ComponentType) => {
    switch (type) {
      case "database":
        return <Database className="h-6 w-6" />;
      case "server":
        return <Server className="h-6 w-6" />;
      case "client":
        return <Monitor className="h-6 w-6" />;
      case "api":
        return <Globe className="h-6 w-6" />;
      case "cache":
        return <HardDrive className="h-6 w-6" />;
      case "loadBalancer":
        return <Activity className="h-6 w-6" />;
      case "cdn":
        return <Cloud className="h-6 w-6" />;
      case "queue":
        return <MessageSquare className="h-6 w-6" />;
      case "messageBroker":
        return <Network className="h-6 w-6" />;
      case "microservice":
        return <GitBranch className="h-6 w-6" />;
      default:
        return <Server className="h-6 w-6" />;
    }
  };

  // Get color for component type
  const getComponentColor = (type: ComponentType) => {
    switch (type) {
      case "database":
        return "bg-blue-500/10 border-blue-500/30 text-blue-500";
      case "server":
        return "bg-purple-500/10 border-purple-500/30 text-purple-500";
      case "client":
        return "bg-green-500/10 border-green-500/30 text-green-500";
      case "api":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-500";
      case "cache":
        return "bg-red-500/10 border-red-500/30 text-red-500";
      case "loadBalancer":
        return "bg-orange-500/10 border-orange-500/30 text-orange-500";
      case "cdn":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-500";
      case "queue":
        return "bg-pink-500/10 border-pink-500/30 text-pink-500";
      case "messageBroker":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-500";
      case "microservice":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
      default:
        return "bg-gray-500/10 border-gray-500/30 text-gray-500";
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
        <h1 className="text-3xl font-bold tracking-tight">System Design Studio</h1>
        <p className="text-muted-foreground mt-2">
          Design and visualize system architectures with our interactive diagramming tools
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto">
          <TabsTrigger value="diagram" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Diagram
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Templates
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
                  <span>Architecture Canvas</span>
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
                Drag and drop components to design your system architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                {/* Component Palette */}
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
                
                {/* Canvas Area */}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <span>System Design Templates</span>
              </CardTitle>
              <CardDescription>
                Start with pre-built templates for common system design patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ y: -5 }}
                    className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="aspect-video bg-muted/30 rounded-md border border-border/50 mb-3 flex items-center justify-center">
                      <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">{template.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      Use Template
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card className="backdrop-blur-xl bg-background/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>System Design Documentation</span>
              </CardTitle>
              <CardDescription>
                Learn about system design principles and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Scalability Patterns
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Server className="h-4 w-4" />
                        Horizontal Scaling
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Adding more machines to handle increased load. This is more cost-effective and fault-tolerant than vertical scaling.
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4" />
                        Database Sharding
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Splitting a database into smaller, more manageable pieces distributed across multiple servers.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Security Considerations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4" />
                        Authentication & Authorization
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Implement proper authentication mechanisms (OAuth, JWT) and authorization checks to protect resources.
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Network className="h-4 w-4" />
                        Rate Limiting
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Prevent abuse by limiting the number of requests a user can make in a given timeframe.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Performance Optimization
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <HardDrive className="h-4 w-4" />
                        Caching Strategies
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Use Redis/Memcached for frequently accessed data and implement proper cache invalidation.
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Cloud className="h-4 w-4" />
                        CDN Implementation
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Distribute content geographically to reduce latency and improve user experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}