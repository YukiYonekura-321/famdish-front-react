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
};

module.exports = config;
