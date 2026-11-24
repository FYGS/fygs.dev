"use client";

import { motion, type Transition } from "framer-motion";
import Image from "next/image";

export function LoaderAnimation() {
  const spinTransition: Transition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs"
    >
      <div className="relative">
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
            priority
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
