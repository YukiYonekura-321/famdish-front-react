/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // CSS / スタイル → identity proxy
    "\\.(css|scss|sass)$": "identity-obj-proxy",
    // @/* パスエイリアス → src/*
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(firebase|@firebase)/)"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // ── カバレッジ設定 (npm test -- --coverage で実行) ──
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
    "!src/**/index.js", // 再エクスポートのみのバレルファイルを除外
    "!src/app/layout.js", // Next.js レイアウト
    "!src/app/globals.css",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov", "html"],
  coverageThreshold: {
    global: {
      statements: 15,
      branches: 20,
      functions: 25,
      lines: 15,
    },
  },
};

module.exports = config;
