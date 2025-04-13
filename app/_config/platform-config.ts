export const platformConfig = {
  features: {
    playground: {
      enabled: true,
      supportedLanguages: [
        "typescript",
        "javascript",
        "html",
        "css",
        "python",
        "rust",
        "go",
      ],
      worker: true,
      monaco: {
        theme: "vs-dark",
        features: {
          hover: true,
          suggestions: true,
          autocompletion: true,
          formatOnPaste: true,
          formatOnType: true,
        },
        layout: {
          minimap: {
            enabled: true,
            maxColumn: 120,
          },
          lineNumbers: "on",
          wordWrap: "on",
          fontSize: 14,
        },
      },
    },
    ui: {
      glassmorphism: true,
      animations: true,
      reducedMotion: "respect",
    },
    performance: {
      imageOptimization: true,
      codeSplitting: true,
      prefetching: true,
      streaming: true,
    },
  },
  appearance: {
    glass: {
      opacity: 0.8,
      blur: "16px",
      border: "1px",
      fallback: "rgba(255,255,255,0.05)",
    },
    transitions: {
      duration: "0.3s",
      timing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
} as const;
