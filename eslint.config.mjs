import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      ".intlayer/**",
      "node_modules/**",
      "public/sw.js",
      "public/workbox-*.js",
      "playwright-report/**",
      "next-env.d.ts",
      "lib/generated/**",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // eslint-plugin-react-hooks 7 added React Compiler checks. They flag patterns
    // that work today (fetch-in-effect, refs, try/catch around JSX), so they are
    // reported as warnings instead of blocking the build; fix them progressively.
    rules: {
      "react-hooks/error-boundaries": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/globals": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
  {
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // --- lint-app overrides ---
  // Everything outside tech-mastry is clean for the React Compiler / Next link rules: keep it that way.
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    ignores: ["app/**/tech-mastry/**"],
    rules: {
      "react-hooks/error-boundaries": "error",
      "react-hooks/set-state-in-effect": "error",
      "react-hooks/purity": "error",
      "react-hooks/immutability": "error",
      "react-hooks/refs": "error",
      "react-hooks/static-components": "error",
      "react-hooks/globals": "error",
      "react-hooks/incompatible-library": "error",
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-location-assign-relative-destination": "error",
    },
  },
  // --- end lint-app overrides ---
];

export default eslintConfig;
