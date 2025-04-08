"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function AutoLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    // Écouter les événements de navigation
    window.addEventListener("beforeunload", handleStart);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        handleStop();
      }
    });

    return () => {
      window.removeEventListener("beforeunload", handleStart);
    };
  }, []);

  // Déclencher le chargement lors des changements de route
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1,
  };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="relative">
            {/* Effet de pulsation */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/10"
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 1.05, opacity: 0.8 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
                ease: "easeInOut",
              }}
            />
            
            {/* Logo en rotation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={spinTransition}
              className="relative"
            >
              <Image
                src="/images/favicon.svg"
                alt="Loading..."
                width={48}
                height={48}
                className="relative z-10"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
