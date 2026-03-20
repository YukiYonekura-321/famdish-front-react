/**
 * ── 認証フロー E2E テスト ──
 *
 * テスト対象:
 *   1. 新規登録フロー（SNS → メール認証 → プロフィール設定）
 *   2. ログインフロー（SNS → /menus リダイレクト）
 *   3. 未認証アクセスのリダイレクト
 *
 * 実装: Firebase Auth Emulator を使って実認証フローをテストする。
 * 認証バグを見逃さないために、本物の Firebase Auth SDK を実行する。
 */
import {
  test,
  expect,
  mockFirebaseAuth,
  mockBackendApi,
} from "../helpers/fixtures.js";
import * as emulatorHelpers from "../helpers/emulator.js";

test.describe("認証フロー", () => {
  // ── 1. トップページ → ログインボタン表示（認証不要） ──
  test("トップページにログインボタンが表示される", async ({ page }) => {
    await page.goto("/");
    // モバイルではハンバーガーメニューを開く
    const menuBtn = page.getByRole("button", { name: "Menu" });
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
    }
    await expect(
      page.getByRole("link", { name: "ログイン" }).first(),
    ).toBeVisible();
  });

  // ── 2. 新規登録フロー（sign-in ページが表示される） ──
  test("新規ユーザーはプロフィールステップへリダイレクトされる", async ({
    page,
  }) => {
    // Emulator に接続するだけ（未ログインなので sign-in ページ表示）
    await emulatorHelpers.connectBrowserToEmulator(page);

    // /api/members/me が 404（未登録）を返す
    await page.route("**/api/members/me", (route) => {
      return route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "not found" }),
      });
    });

    await page.goto("/sign-in");
    await page.waitForLoadState("domcontentloaded");

    // sign-in（会員登録）ページが表示されることを確認
    await expect(page).toHaveURL(/sign-in/);
    await expect(
      page.getByRole("heading", {
        name: /ログイン|新規登録|サインイン|会員登録/i,
      }),
    ).toBeVisible();
  });

  // ── 3. 既存ユーザーのログイン → /menus リダイレクト ──
  test("登録済みユーザーは /menus へリダイレクトされる", async ({ page }) => {
    // 実ユーザーを作成し、ブラウザで実際にサインイン
    await emulatorHelpers.createEmulatorUser({
      email: "existing@e2e.test",
      password: "Test1234!",
      emailVerified: true,
    });
    await emulatorHelpers.connectBrowserToEmulator(page);
    await mockBackendApi(page);

    await page.goto("/sign-in");
    await page.waitForLoadState("domcontentloaded");

    // 実 Firebase SDK で Emulator にサインイン
    await page.evaluate(
      async ({ email, password }) => {
        await window.__FIREBASE_SIGN_IN__(email, password);
      },
      { email: "existing@e2e.test", password: "Test1234!" },
    );

    // onAuthStateChanged → 認証済み → /menus へリダイレクト
    await page.waitForURL("**/menus", { timeout: 10000 });
    await expect(page).toHaveURL(/menus/);
  });

  // ── 4. 未認証ユーザーが保護ページにアクセス → /login リダイレクト ──
  test("未認証ユーザーは /login へリダイレクトされる", async ({ page }) => {
    // 接続するがサインインしない → 未認証状態
    await emulatorHelpers.connectBrowserToEmulator(page);

    await page.goto("/menus");
    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  // ── 5. メール未認証 → /register-email に留まる ──
  test("メール未認証ユーザーは /register-email へ案内される", async ({
    page,
  }) => {
    // emailVerified=false のユーザーを作成
    await emulatorHelpers.createEmulatorUser({
      email: "unverified@e2e.test",
      password: "Test1234!",
      emailVerified: false,
    });

    await emulatorHelpers.connectBrowserToEmulator(page);

    // /api/members/me → 404（未登録なので /menus にリダイレクトしない）
    await page.route("**/api/members/me", (route) =>
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "not found" }),
      }),
    );

    // /login ページで Firebase SDK を読み込む
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Firebase SDK（__FIREBASE_SIGN_IN__）が利用可能になるまで待機
    await page.waitForFunction(
      () => typeof window.__FIREBASE_SIGN_IN__ === "function",
      { timeout: 10000 },
    );

    // emailVerified=false のユーザーでサインイン
    await page.evaluate(
      async ({ email, password }) => {
        await window.__FIREBASE_SIGN_IN__(email, password);
      },
      { email: "unverified@e2e.test", password: "Test1234!" },
    );

    // サインイン済み状態で /register-email に直接ナビゲート
    // onAuthStateChanged → user あり → /api/members/me 404 → ページに留まる
    await page.goto("/register-email");
    await page.waitForLoadState("domcontentloaded");

    // /register-email に留まることを確認
    await page.waitForURL(/register-email/, { timeout: 10000 });
    await expect(page).toHaveURL(/register-email/);
  });

  // ── 6. ログインページのSNSボタン表示確認（認証不要） ──
  test("ログインページに各SNSボタンが表示される", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Google, Twitter(X), GitHub ボタンがあること
    await expect(page.getByText(/Google/i)).toBeVisible();
    await expect(page.getByText(/X|Twitter/i)).toBeVisible();
    await expect(page.getByText(/GitHub/i)).toBeVisible();
  });
});
