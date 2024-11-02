"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface AvailabilityIndicatorProps {
  className?: string;
}

export function AvailabilityIndicator({
  className,
}: AvailabilityIndicatorProps) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [localTime, setLocalTime] = useState<string>("");

  useEffect(() => {
    // Fuseau horaire de Paris
    const parisTimeZone = "Europe/Paris";

    const updateAvailability = () => {
      const now = new Date();
      const parisTime = new Intl.DateTimeFormat("en-US", {
        timeZone: parisTimeZone,
        hour: "numeric",
        hour12: false,
      }).format(now);

      const hour = parseInt(parisTime);
      // Disponible entre 9h et 18h en semaine
      const isWorkingHour = hour >= 9 && hour < 18;
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

      setIsAvailable(isWorkingHour && isWeekday);
      setLocalTime(
        new Intl.DateTimeFormat("en-US", {
          timeZone: parisTimeZone,
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZoneName: "short",
        }).format(now)
      );
    };

    updateAvailability();
    const interval = setInterval(updateAvailability, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        isAvailable ? "text-green-500" : "text-yellow-500",
        className
      )}
    >
      <motion.div
        className={cn(
          "size-2 rounded-full",
          isAvailable ? "bg-green-500" : "bg-yellow-500"
        )}
        animate={{
          scale: isAvailable ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <span className="font-medium">
        {isAvailable ? "Available now" : "Away"}
      </span>
      <span className="text-muted-foreground flex items-center gap-1">
        <Clock className="size-3" />
        {localTime}
      </span>
    </div>
  );
}
