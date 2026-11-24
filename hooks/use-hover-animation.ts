import { useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export function useHoverAnimation() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const smoothX = useSpring(x, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 300, damping: 30 });
  const smoothScale = useSpring(scale, { stiffness: 300, damping: 30 });

  useEffect(() => {
    return () => {
      x.set(0);
      y.set(0);
      scale.set(1);
    };
  }, [x, y, scale]);

  return { x: smoothX, y: smoothY, scale: smoothScale };
}
