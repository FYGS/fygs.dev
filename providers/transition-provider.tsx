"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <div key={pathname} className="h-full">
        {children}
      </div>
    </AnimatePresence>
  );
}
