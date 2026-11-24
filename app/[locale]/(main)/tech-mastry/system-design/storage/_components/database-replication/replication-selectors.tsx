"use client";

import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowRight, Clock, RotateCw, Shield, Zap } from "lucide-react";
import type { ConsistencyModel, ReplicationType } from "./types";

interface ReplicationSelectorsProps {
  replicationType: ReplicationType;
  setReplicationType: (type: ReplicationType) => void;
  consistencyModel: ConsistencyModel;
  setConsistencyModel: (model: ConsistencyModel) => void;
}

export function ReplicationSelectors({
  replicationType,
  setReplicationType,
  consistencyModel,
  setConsistencyModel,
}: ReplicationSelectorsProps) {
  return (
    <>
      {/* Replication Type Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md border p-1 bg-muted/30">
          <Button
            variant={
              replicationType === "master-slave" ? "default" : "ghost"
            }
            size="sm"
            onClick={() => setReplicationType("master-slave")}
            className="flex items-center gap-1"
          >
            <ArrowDown className="h-4 w-4" />
            <span>Master-Slave</span>
          </Button>
          <Button
            variant={
              replicationType === "master-master" ? "default" : "ghost"
            }
            size="sm"
            onClick={() => setReplicationType("master-master")}
            className="flex items-center gap-1"
          >
            <ArrowRight className="h-4 w-4" />
            <span>Master-Master</span>
          </Button>
          <Button
            variant={
              replicationType === "multi-master" ? "default" : "ghost"
            }
            size="sm"
            onClick={() => setReplicationType("multi-master")}
            className="flex items-center gap-1"
          >
            <RotateCw className="h-4 w-4" />
            <span>Multi-Master</span>
          </Button>
        </div>
      </div>

      {/* Consistency Model Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md border p-1 bg-muted/30">
          <Button
            variant={consistencyModel === "async" ? "default" : "ghost"}
            size="sm"
            onClick={() => setConsistencyModel("async")}
            className="flex items-center gap-1"
          >
            <Zap className="h-4 w-4" />
            <span>Asynchrone</span>
          </Button>
          <Button
            variant={
              consistencyModel === "semi-sync" ? "default" : "ghost"
            }
            size="sm"
            onClick={() => setConsistencyModel("semi-sync")}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            <span>Semi-Sync</span>
          </Button>
          <Button
            variant={consistencyModel === "sync" ? "default" : "ghost"}
            size="sm"
            onClick={() => setConsistencyModel("sync")}
            className="flex items-center gap-1"
          >
            <Shield className="h-4 w-4" />
            <span>Synchrone</span>
          </Button>
        </div>
      </div>
    </>
  );
}
