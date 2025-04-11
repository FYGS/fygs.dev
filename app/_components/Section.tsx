import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export const Section = ({
  children,
  className,
  content = false,
}: PropsWithChildren<{ className?: string; content?: boolean }>) => {
  return (
    <section
      className={cn(content ? "container-content" : "container-xl", className)}
    >
      {children}
    </section>
  );
};
