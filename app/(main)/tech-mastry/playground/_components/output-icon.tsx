import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";
import { ComponentProps } from "react";

export function OutputIcon({
  className,
  ...props
}: ComponentProps<typeof Terminal>) {
  return <Terminal className={cn("animate-pulse", className)} {...props} />;
}
