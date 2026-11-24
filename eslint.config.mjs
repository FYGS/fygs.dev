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
      // Generated bundle (scripts/build-sandbox-vendor.mjs), checked by its SHA-384 hash instead
      "public/sandbox/vendor/**",
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
    // eslint-plugin-react-hooks 7 added React Compiler checks, and Next's link
    // rules: the whole codebase is clean, keep it that way.
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
  {
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
