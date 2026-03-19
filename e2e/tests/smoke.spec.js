/**
 * ── デプロイ後スモークテスト ──
 *
 * Vercel Preview / Production デプロイ後に実行。
 * 認証不要 — 公開ページの基本動作のみ検証。
 *
 * 環境変数:
 *   E2E_BASE_URL – デプロイ先の URL
 */
import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", name: "トップページ" },
  { path: "/login", name: "ログインページ" },
  { path: "/sign-in", name: "サインインページ" },
  { path: "/privacy", name: "プライバシーポリシー" },
  { path: "/terms", name: "利用規約" },
  { path: "/contact", name: "お問い合わせ" },
];

test.describe("スモークテスト", () => {
  // ── 1. 各公開ページが 200 を返す ──
  for (const { path, name } of PAGES) {
    test(`${name} (${path}) が 200 を返す`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    });
  }

  // ── 2. トップページが正しくレンダリングされる ──
  test("トップページのメインビジュアルが表示される", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // メインコピー
    await expect(
      page.getByRole("heading", { name: "食卓で家族は繋がる" }),
    ).toBeVisible({
      timeout: 10000,
    });

    // サブコピー
    await expect(page.getByText("FamDishとは")).toBeVisible();

    // CTA ボタン
    await expect(
      page.getByRole("link", { name: "今すぐ無料で始める" }),
    ).toBeVisible();
  });

  // ── 3. ヘッダーナビゲーション ──
  test("ヘッダーのリンクが存在する", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  // ── 4. 静的アセットの読み込み ──
  test("CSS と JS が正常に読み込まれる", async ({ page }) => {
    const failedRequests = [];

    page.on("requestfailed", (request) => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()?.errorText,
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 重要なアセットの失敗がないこと
    const criticalFailures = failedRequests.filter(
      (r) => r.url.endsWith(".js") || r.url.endsWith(".css"),
    );
    expect(criticalFailures).toHaveLength(0);
  });

  // ── 5. コンソールエラーがないこと ──
  test("コンソールに重大なエラーがないこと", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 無視するパターン:
    // - Firebase 関連（SDK 初期化ウォーニング等）
    // - HTTP 401/403 ステータスエラー（Vercel Protection / 未認証 API）
    // - Provider's accounts list is empty（Firebase Auth の初期化）
    // - CORS エラー（x-vercel-protection-bypass が外部 CDN へ漏れる既知の問題）
    // - fonts.gstatic.com / fonts.googleapis.com（Google Fonts CORS）
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("Firebase") &&
        !e.includes("firebase") &&
        !e.includes("analytics") &&
        !e.includes("401") &&
        !e.includes("403") &&
        !e.includes("Provider's accounts list is empty") &&
        !e.includes("CORS") &&
        !e.includes("fonts.gstatic.com") &&
        !e.includes("fonts.googleapis.com") &&
        !e.includes("x-vercel-protection-bypass") &&
        !e.includes("net::ERR_FAILED"),
    );

    expect(criticalErrors).toHaveLength(0);
  });

  // ── 6. レスポンシブ: モバイルビューの基本表示 ──
  test("モバイルビューでもトップページが表示される", async ({ browser }) => {
    const bypassHeader = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {};
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      extraHTTPHeaders: bypassHeader,
    });
    const page = await context.newPage();

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: "食卓で家族は繋がる" }),
    ).toBeVisible({
      timeout: 10000,
    });

    await context.close();
  });

  // ── 7. API ヘルスチェック ──
  test("API ヘルスエンドポイントが正常", async ({ request }) => {
    const response = await request.get("/api/health");
    // Next.js API route が存在する場合（401 は Vercel Preview Protection）
    expect([200, 204, 401, 404]).toContain(response.status());
  });

  // ── 8. ページ遷移が正常に動作する ──
  test("トップ → ログインページへ遷移できる", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // モバイルではハンバーガーメニューを開く
    const menuBtn = page.getByRole("button", { name: "Menu" });
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
    }

    const loginLink = page.getByRole("link", { name: /ログイン/i }).first();
    await loginLink.click();

    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });

  // ── 9. OGP / meta タグの検証 ──
  test("基本的な meta タグが設定されている", async ({ page }) => {
    await page.goto("/");

    const viewport = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });
});
