import coreWebVitals from "eslint-config-next/core-web-vitals";

// Flat config för ESLint 9 (next lint togs bort i Next 16)
export default [
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "next-env.d.ts"],
  },
  ...coreWebVitals,
  {
    // ESLint 9 / react-hooks 6 introducerade striktare regler som den
    // befintliga kodbasen bryter mot på många ställen (setState i effekter
    // för localStorage-laddning m.m.). Varning tills koden refaktorerats.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
    },
  },
];
