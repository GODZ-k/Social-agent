import globals from "globals";
import { config as baseConfig } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  // `.trigger` is the Trigger.dev CLI's own build output and run state, not our code.
  { ignores: ["dist/**", ".trigger/**", "scripts/copy-skills.mjs", "testing/temp/**"] },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
];
