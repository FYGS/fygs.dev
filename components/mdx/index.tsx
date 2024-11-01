import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
import { Card } from "../ui/card";

export const components = {
  h1: ({ className, ...props }: PropsWithChildren<{ className?: string }>) => (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
      {...props}
    />
  ),

  pre: ({ className, ...props }: PropsWithChildren<{ className?: string }>) => (
    <pre className={cn("relative rounded-lg", className)} {...props} />
  ),

  code: ({
    className,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    />
  ),

  Callout: ({ children }: PropsWithChildren) => (
    <Card className="my-6 p-4 border-l-4 border-primary bg-primary/5">
      <div className="flex items-start space-x-4">
        <div className="flex-1">{children}</div>
      </div>
    </Card>
  ),

  Step: ({
    className,
    ...props
  }: PropsWithChildren<{ className?: string }>) => (
    <div
      className={cn(
        "step ml-4 border-l pl-8 [counter-increment:step]",
        className
      )}
      {...props}
    />
  ),
};
