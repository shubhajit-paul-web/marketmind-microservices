import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js },
        extends: [js.configs.recommended, eslintConfigPrettier],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.node,
        },
    },
    {
        rules: {
            "no-unused-vars": "error",
            "prefer-const": "error",
            "no-console": "warn",
            "no-undef": "error",
            "no-unexpected-multiline": "error",
            "no-empty-function": "warn",
            "consistent-return": "warn",
            eqeqeq: "error",
            curly: ["warn", "multi"],
            quotes: [
                "error",
                "double",
                {
                    allowTemplateLiterals: true,
                },
            ],
            camelcase: [
                "error",
                {
                    properties: "never",
                    ignoreDestructuring: false,
                },
            ],
        },
    },
]);
