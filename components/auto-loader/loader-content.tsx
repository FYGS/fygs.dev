"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoaderAnimation } from "./loader-animation";

export function LoaderContent() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

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

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return <AnimatePresence>{loading && <LoaderAnimation />}</AnimatePresence>;
}
