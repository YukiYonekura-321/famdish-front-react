import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser"; // ✅ 直接import！

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    // ✅ ここで対象ファイルを明示！
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    // ✅ ここにルールを記述！
    rules: {
      semi: ["error", "always"],
      // quotes: ["error", "double"],
      // "no-console": ["warn", { allow: ["warn", "error"] }],
      //indent: ["error", 2],
      "no-unused-vars": "warn",
      camelcase: "warn",
      "react/react-in-jsx-scope": "off", // Next.js では不要なので
    },
  },
  {
    // E2E テストファイル用の例外ルール
    files: ["e2e/**/*.js", "playwright.config.js"],
    rules: {
      "import/no-unresolved": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },
];

export default eslintConfig;
