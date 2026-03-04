"use client";

import { GripHorizontal, GripVertical } from "lucide-react";
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
} from "react-resizable-panels";

import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  direction,
  ...props
}: GroupProps & { direction?: "horizontal" | "vertical" }) => (
  <Group
    orientation={direction}
    className={cn("flex h-full w-full", className)}
    {...props}
  />
);

function ResizablePanel(props: PropsWithChildren<PanelProps>) {
  return <Panel {...(props as PanelProps)} />;
}

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: SeparatorProps & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      // Default: vertical separator (in horizontal group)
      "relative flex w-px items-center justify-center bg-border",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      // Horizontal separator (in vertical group): aria-orientation="horizontal"
      "aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full",
      "aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1",
      "aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:-translate-y-1/2",
      "aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:inset-y-auto",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border aria-[orientation=horizontal]:h-3 aria-[orientation=horizontal]:w-4 aria-[orientation=horizontal]:rotate-0">
        <GripVertical className="h-2.5 w-2.5 aria-[orientation=horizontal]:hidden" />
        <GripHorizontal className="hidden h-2.5 w-2.5 aria-[orientation=horizontal]:block" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
