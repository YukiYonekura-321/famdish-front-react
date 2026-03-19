// @ts-check
// @ts-ignore
import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 *
 * 環境変数:
 *   E2E_BASE_URL     – テスト対象の URL（Vercel Preview / localhost）
 *   E2E_API_BASE_URL – バックエンド API の URL（Heroku staging 等）
 */
const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e-results",

  /* テスト全体の最大実行時間 */
  globalTimeout: 10 * 60 * 1000, // 10 min

  /* 各テストのデフォルトタイムアウト */
  timeout: 60 * 1000, // 60s

  /* リトライ: CI では 2 回まで */
  retries: process.env.CI ? 2 : 0,

  /* 並列ワーカー: CI では 1（安定性重視） */
  workers: process.env.CI ? 1 : undefined,

  /* レポーター */
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "e2e-report" }]]
    : [["list"], ["html", { open: "on-failure", outputFolder: "e2e-report" }]],

  /* テスト共通設定 */
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    /* ヘッドレス */
    headless: true,
    /* タイムアウト */
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  /* グローバルセットアップ / ティアダウン */
  globalSetup: "./e2e/global-setup.js",

  /* Firebase Auth Emulator（常に自動起動） */
  webServer: [
    {
      command: "firebase emulators:start --only auth",
      url: `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099"}/`,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],


  /* ブラウザプロジェクト */
  projects: [
    /* ── セットアップ: 認証状態を作成 ── */
    {
      name: "auth-setup",
      testMatch: /auth\.setup\.js/,
    },

    /* ── Chromium ── */
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "./e2e/.auth/user.json",
      },
      dependencies: ["auth-setup"],
    },

    /* ── Mobile Safari (iPhone 14) ── */
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 14"],
        storageState: "./e2e/.auth/user.json",
      },
      dependencies: ["auth-setup"],
    },

    /* ── Smoke: デプロイ後スモークテスト（認証不要） ── */
    {
      name: "smoke",
      testMatch: /smoke\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
