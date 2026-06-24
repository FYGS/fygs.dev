"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Flame } from "lucide-react";
interface XpNotificationProps {
  amount: number;
  reason: string;
  streak?: number;
}

export function XpNotification({
  amount,
  reason,
  streak,
}: XpNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[100]"
        >
          <div className="flex items-center gap-3 bg-background border rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10">
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">+{amount} XP</p>
              <p className="text-xs text-muted-foreground">{reason}</p>
            </div>
            {streak && streak > 1 && (
              <div className="flex items-center gap-1 ml-2 px-2 py-1 rounded-full bg-orange-500/10">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-600">
                  {streak}j
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
