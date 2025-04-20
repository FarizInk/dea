import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginTS from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import pkg from '@typescript-eslint/eslint-plugin';

const { configs: tsConfigs } = pkg;

export default [
  {
    files: ["**/*.ts", "**/*.tsx"], // 👈 Ensure TypeScript files are included
    ignores: [
      "node_modules/*",
      "cache/*",
    ], // 👈 Keep this to avoid linting build files
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": eslintPluginTS,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...tsConfigs.recommended.rules,
      "prettier/prettier": "error",
    },
  },
];
