"use client";

import { Suspense, ReactNode } from "react";
import { LoadingSpinner } from "./loading-spinner";
import { FadeIn } from "./fade-in";

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function SuspenseWrapper({ 
  children, 
  fallback, 
  className = "" 
}: SuspenseWrapperProps) {
  const defaultFallback = (
    <FadeIn className={`flex items-center justify-center py-12 ${className}`}>
      <LoadingSpinner size="lg" text="Chargement..." />
    </FadeIn>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

export function AsyncComponentWrapper({ 
  children, 
  className = "",
  loadingText = "Chargement..."
}: {
  children: ReactNode;
  className?: string;
  loadingText?: string;
}) {
  return (
    <SuspenseWrapper
      fallback={
        <div className={`flex items-center justify-center py-8 ${className}`}>
          <LoadingSpinner size="md" text={loadingText} />
        </div>
      }
    >
      {children}
    </SuspenseWrapper>
  );
}
