import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "apps/web/next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "**/*.min.js",
    ],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { parser: tsParser, globals: { process: "readonly" } },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: tsPlugin.configs.recommended.rules,
  },
];