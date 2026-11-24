"use client";

import { Button } from "@/components/ui/button";
import type { Dispatch, SetStateAction } from "react";
import type { ServiceMeshType } from "./types";

export function MeshTypeSelector({ serviceMeshType, setServiceMeshType }: {
  serviceMeshType: ServiceMeshType;
  setServiceMeshType: Dispatch<SetStateAction<ServiceMeshType>>;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
      <span className="text-sm font-medium mr-2 self-center">
        Service Mesh Type:
      </span>
      <Button
        variant={serviceMeshType === "istio" ? "default" : "outline"}
        size="sm"
        onClick={() => setServiceMeshType("istio")}
        className="flex items-center gap-1.5"
      >
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        Istio
      </Button>
      <Button
        variant={serviceMeshType === "linkerd" ? "default" : "outline"}
        size="sm"
        onClick={() => setServiceMeshType("linkerd")}
        className="flex items-center gap-1.5"
      >
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        Linkerd
      </Button>
      <Button
        variant={serviceMeshType === "consul" ? "default" : "outline"}
        size="sm"
        onClick={() => setServiceMeshType("consul")}
        className="flex items-center gap-1.5"
      >
        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
        Consul Connect
      </Button>
      <Button
        variant={serviceMeshType === "app-mesh" ? "default" : "outline"}
        size="sm"
        onClick={() => setServiceMeshType("app-mesh")}
        className="flex items-center gap-1.5"
      >
        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
        AWS App Mesh
      </Button>
    </div>
  );
}
