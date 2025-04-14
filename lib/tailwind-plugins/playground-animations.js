// Tailwind plugin for playground animations
import plugin from "tailwindcss/plugin";

export default plugin(function ({ addUtilities, addComponents }) {
  // Add keyframes
  addUtilities({
    "@keyframes blob": {
      "0%": {
        transform: "translate(0px, 0px) scale(1)",
      },
      "33%": {
        transform: "translate(30px, -50px) scale(1.1)",
      },
      "66%": {
        transform: "translate(-20px, 20px) scale(0.9)",
      },
      "100%": {
        transform: "translate(0px, 0px) scale(1)",
      },
    },
    "@keyframes pulse-glow": {
      "0%": {
        "box-shadow": "0 0 0 0 hsl(var(--primary) / 0.4)",
      },
      "70%": {
        "box-shadow": "0 0 0 10px hsl(var(--primary) / 0)",
      },
      "100%": {
        "box-shadow": "0 0 0 0 hsl(var(--primary) / 0)",
      },
    },
    "@keyframes futuristic-spin": {
      "0%": {
        transform: "rotate(0deg)",
        "border-color":
          "hsl(var(--primary) / 0.8) transparent hsl(var(--primary) / 0.2) transparent",
      },
      "50%": {
        transform: "rotate(180deg)",
        "border-color":
          "hsl(var(--primary) / 0.2) transparent hsl(var(--primary) / 0.8) transparent",
      },
      "100%": {
        transform: "rotate(360deg)",
        "border-color":
          "hsl(var(--primary) / 0.8) transparent hsl(var(--primary) / 0.2) transparent",
      },
    },
    "@keyframes gradient-xy": {
      "0%, 100%": {
        "background-position": "0% 0%",
      },
      "25%": {
        "background-position": "100% 0%",
      },
      "50%": {
        "background-position": "100% 100%",
      },
      "75%": {
        "background-position": "0% 100%",
      },
    },
  });

  // Add animation utilities
  addUtilities({
    ".animate-blob": {
      animation: "blob 10s infinite",
    },
    ".animate-pulse-glow": {
      animation: "pulse-glow 2s infinite",
    },
    ".animate-futuristic-spin": {
      animation: "futuristic-spin 1.5s linear infinite",
    },
    ".animation-delay-2000": {
      "animation-delay": "2s",
    },
    ".animation-delay-3000": {
      "animation-delay": "3s",
    },
    ".animation-delay-4000": {
      "animation-delay": "4s",
    },
  });

  // Add component classes
  addComponents({
    ".futuristic-spinner": {
      width: "40px",
      height: "40px",
      border: "4px solid",
      "border-color":
        "hsl(var(--primary) / 0.8) transparent hsl(var(--primary) / 0.2) transparent",
      "border-radius": "50%",
      animation: "futuristic-spin 1.5s linear infinite",
    },
    ".shortcut-kbd": {
      display: "inline-block",
      "background-color": "rgba(var(--primary-rgb), 0.2)",
      color: "rgb(var(--primary-rgb))",
      padding: "2px 6px",
      "margin-left": "6px",
      "font-size": "0.75rem",
      "font-weight": "600",
      "border-radius": "4px",
      "font-family":
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      "box-shadow": "0 1px 2px rgba(0, 0, 0, 0.1)",
    },
    ".glass-panel": {
      "backdrop-filter": "blur(12px)",
      "-webkit-backdrop-filter": "blur(12px)",
      background:
        "linear-gradient(135deg, hsl(var(--background) / 0.7), hsl(var(--background) / 0.3))",
      border: "1px solid hsl(var(--border) / 0.2)",
      "box-shadow":
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    ".neon-border": {
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        inset: "0",
        "border-radius": "inherit",
        padding: "1px",
        background:
          "linear-gradient(45deg, hsl(var(--primary) / 0.7), transparent, hsl(var(--primary) / 0.7))",
        "-webkit-mask":
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        "-webkit-mask-composite": "xor",
        "mask-composite": "exclude",
        "pointer-events": "none",
      },
    },
  });
});
