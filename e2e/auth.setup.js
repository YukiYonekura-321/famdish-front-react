/**
 * ── 認証セットアップ ──
 *
 * Firebase Auth Emulator で認証済みユーザーを作成し、
 * 認証済み storageState を保存する。
 * Playwright projects の依存関係として使用。
 */
import { test as setup } from "@playwright/test";
import { mockFirebaseAuth, mockBackendApi } from "./helpers/fixtures.js";
import * as emulatorHelpers from "./helpers/emulator.js";

const authFile = "./e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // 前回のテスト実行から残ったユーザーをクリア
  await emulatorHelpers.clearEmulatorUsers();

  // Emulator にテストユーザーを作成
  await emulatorHelpers.createEmulatorUser({
    email: "e2e@famdish.test",
    password: "Test1234!",
    emailVerified: true,
  });

  // Firebase Auth Emulator に接続
  await mockFirebaseAuth(page);

  // 診断: Firebase グローバルが定義されているか確認
  const firebaseGlobals = await page.evaluate(() => {
    return {
      hasSignIn: typeof window.__FIREBASE_SIGN_IN__ === "function",
      hasAuth: typeof window.__FIREBASE_AUTH__ !== "undefined",
      hasFirebase: typeof window.firebase !== "undefined",
      windowKeys: Object.keys(window)
        .filter((k) => k.includes("__FIREBASE") || k.includes("firebase"))
        .slice(0, 10),
    };
  });
  console.log("[E2E Diagnostic]", firebaseGlobals);

  // バックエンド API モック
  await mockBackendApi(page);

  // トップページに遷移して認証状態を構築
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // 実ユーザーでサインイン（Emulatorで認証を確立）
  await page.evaluate(
    async ({ email, password }) => {
      if (typeof window.__FIREBASE_SIGN_IN__ === "function") {
        await window.__FIREBASE_SIGN_IN__(email, password);
      }
    },
    { email: "e2e@famdish.test", password: "Test1234!" },
  );

  // storageState を保存（以降のテストで再利用）
  await page.context().storageState({ path: authFile });
});
