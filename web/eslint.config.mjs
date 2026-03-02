import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat({
  baseDirectory: new URL(".", import.meta.url).pathname
});

export default [
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript")
];
