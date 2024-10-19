import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

export const Code = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) => {
  return (
    <span
      className={cn(
        "bg-gray-800 font-mono border hover:bg-gray-700 transition-colors border-gray-600 px-1 py-0.5 rounded-sm text-gray-300",
        className
      )}
    >
      {props.children}
    </span>
  );
};
