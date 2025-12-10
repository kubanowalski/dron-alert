import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

/**
 * Konfiguracja ESLint
 * To narzędzie sprawdza czy kod jest poprawny i czy nie ma w nim błędów.
 * Rozszerzamy tutaj standardowe ustawienia Next.js i ignorujemy wybrane foldery.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
