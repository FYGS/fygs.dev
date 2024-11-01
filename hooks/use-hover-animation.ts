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
    function handleMouseMove(event: MouseEvent) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const moveX = (event.clientX - centerX) * 0.1;
      const moveY = (event.clientY - centerY) * 0.1;

      x.set(moveX);
      y.set(moveY);
      scale.set(1.05);
    }

    function handleMouseLeave() {
      x.set(0);
      y.set(0);
      scale.set(1);
    }

    return () => {
      x.set(0);
      y.set(0);
      scale.set(1);
    };
  }, [x, y, scale]);

  return { x: smoothX, y: smoothY, scale: smoothScale };
}
