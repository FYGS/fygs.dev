"use client";

import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";
import type { Server as ServerNode } from "./types";

interface ServerStatusProps {
  servers: ServerNode[];
}

export function ServerStatus({ servers }: ServerStatusProps) {
  return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500">
              <Server className="h-5 w-5" />
            </div>
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-500">
              État des Serveurs
            </span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {servers.map((server) => (
              <div
                key={server.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 hover:shadow-md ${
                  server.status === "online"
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:shadow-emerald-500/10"
                    : server.status === "offline"
                    ? "border-red-500/30 bg-red-500/5 hover:shadow-red-500/10"
                    : "border-amber-500/30 bg-amber-500/5 hover:shadow-amber-500/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      server.status === "online"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : server.status === "offline"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    <Server className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">
                    Server {server.id}
                    <span className="block text-xs text-muted-foreground">
                      Load: {server.load}
                    </span>
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`px-2.5 py-1 ${
                    server.status === "online"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                      : server.status === "offline"
                      ? "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                  }`}
                >
                  {server.status === "online"
                    ? "En ligne"
                    : server.status === "offline"
                    ? "Hors ligne"
                    : "Surchargé"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
  );
}
