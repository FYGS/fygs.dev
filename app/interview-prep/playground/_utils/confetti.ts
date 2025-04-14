import confetti from "canvas-confetti";

// Predefined confetti configurations
export const confettiConfigs = {
  // Success animation with green confetti
  success: {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#10b981", "#34d399", "#6ee7b7"], // Emerald colors
    gravity: 0.8,
    scalar: 1.2,
    drift: 0,
    ticks: 200,
    shapes: ["circle" as const, "square" as const],
    zIndex: 9999,
  },

  // Fireworks effect
  fireworks: () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Use random colors
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
      });
    }, 250);
  },

  // School pride effect
  schoolPride: () => {
    const end = Date.now() + 1500;

    // Emerald colors for the theme
    const colors = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        zIndex: 9999,
      });

      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  },
};

// Function to trigger a success animation
export const triggerSuccessConfetti = () => {
  confetti(confettiConfigs.success);
};

// Function to trigger a fireworks animation
export const triggerFireworks = () => {
  confettiConfigs.fireworks();
};

// Function to trigger a school pride animation
export const triggerSchoolPride = () => {
  confettiConfigs.schoolPride();
};

// Function to trigger a custom confetti animation
export const triggerCustomConfetti = (options: confetti.Options) => {
  confetti(options);
};

// Named exports only
// No default export to avoid ESLint warning
