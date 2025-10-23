"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

interface OptimizedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  gradient?: boolean;
}

export const OptimizedCard = memo(function OptimizedCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  gradient = false,
}: OptimizedCardProps) {
  const cardClassName = useMemo(() => {
    return cn(
      "border-0 shadow-lg transition-all duration-300 hover:shadow-xl",
      gradient && "bg-linear-to-br from-card via-card to-muted/20",
      className
    );
  }, [className, gradient]);

  const headerClass = useMemo(() => {
    return cn("pb-4", headerClassName);
  }, [headerClassName]);

  const contentClass = useMemo(() => {
    return cn("pt-0", contentClassName);
  }, [contentClassName]);

  return (
    <Card className={cardClassName}>
      {(title || description) && (
        <CardHeader className={headerClass}>
          {title && (
            <CardTitle className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {title}
            </CardTitle>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent className={contentClass}>
        {children}
      </CardContent>
    </Card>
  );
});

export default OptimizedCard;
