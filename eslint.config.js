// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  // Expo base config
  expoConfig,

  // Your custom rules
  {
    ignores: ["dist/*"],

    rules: {
      "@typescript-eslint/no-require-imports": "error",
    },
  },
]);
