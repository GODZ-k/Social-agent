import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // Agent skill folders ship their own helper scripts; they aren't application code.
  { ignores: [".agents/**", ".claude/**"] },
  ...nextJsConfig,
];
