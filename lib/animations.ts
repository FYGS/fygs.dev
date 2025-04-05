export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export const scaleIn = {
  initial: { scale: 0.95 },
  hover: { scale: 1.05 },
  tap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
};
