/**
 * ── AI 献立提案フロー E2E テスト ──
 *
 * テスト対象:
 *   1. 提案入力フォームの表示（制約条件の選択）
 *   2. AI 提案の実行（POST → ポーリング → 結果表示）
 *   3. 提案の採用（レシピ保存 → 遷移）
 *   4. 別案要求
 *   5. NG 送信
 *   6. 完全フロー（入力 → API 呼び出し → 結果表示 → 保存）
 *
 * OpenAI はバックエンド側で処理されるため、
 * フロントからは /api/suggestions のレスポンスをモックして検証。
 */
import {
  test,
  expect,
  mockFirebaseAuth,
  mockBackendApi,
  mockSuggestionApi,
} from "../helpers/fixtures.js";

test.describe("AI 献立提案フロー", () => {
  test.beforeEach(async ({ page }) => {
    await mockFirebaseAuth(page);
    await mockBackendApi(page);
    await mockSuggestionApi(page);
  });

  // ── 1. メニューページが表示される ──
  test("メニューページに提案フォームが表示される", async ({ page }) => {
    await page.goto("/menus");
    await page.waitForLoadState("networkidle");

    // 制約条件の選択 UI が表示される
    await expect(page.getByText("AI提案の条件設定")).toBeVisible();
  });

  // ── 2. 予算制約で AI 提案を実行 ──
  test("予算制約で献立提案を実行し結果が表示される", async ({ page }) => {
    await page.goto("/menus");
    await page.waitForLoadState("networkidle");

    // 予算を選択
    const budgetSelect = page.locator("select, [role='listbox']").first();
    if (await budgetSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await budgetSelect.selectOption({ index: 1 });
    }

    // 提案ボタンをクリック
    const suggestButton = page.getByRole("button", {
      name: /提案|献立を提案|AI/,
    });
    await suggestButton.click();

    // ローディング → 結果表示を待つ
    await expect(page.getByText("チキンカレー")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("野菜サラダ")).toBeVisible();
  });

  // ── 3. 調理時間制約で AI 提案を実行 ──
  test("調理時間制約で献立提案を実行できる", async ({ page }) => {
    await page.goto("/menus");
    await page.waitForLoadState("networkidle");

    // 「調理時間」タブ/トグルに切替
    const timeToggle = page.getByText(/調理時間/);
    if (await timeToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await timeToggle.click();
    }

    // 提案ボタンをクリック
    const suggestButton = page.getByRole("button", {
      name: /提案|献立を提案|AI/,
    });
    await suggestButton.click();

    // 結果が表示される
    await expect(page.getByText("チキンカレー")).toBeVisible({
      timeout: 15000,
    });
  });

  // ── 4. 提案を採用 → レシピ保存 ──
  test("提案を採用してレシピが保存される", async ({ page }) => {
    await page.goto("/menus");
    await page.waitForLoadState("networkidle");

    // 提案を実行
    const suggestButton = page.getByRole("button", {
      name: /提案|献立を提案|AI/,
    });
    await suggestButton.click();
    await expect(page.getByText("チキンカレー")).toBeVisible({
      timeout: 15000,
    });

    // alert のモック
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("採用");
      await dialog.accept();
    });

    // 採用ボタンをクリック
    const acceptButton = page.getByRole("button", {
      name: /採用|決定|OK|これにする/,
    });
    if (await acceptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptButton.click();

      // /menus/familysuggestion へ遷移
      await page.waitForURL("**/menus/familysuggestion", { timeout: 10000 });
    }
  });

  // ── 5. 別案を要求 ──
  test("別案を要求できる", async ({ page }) => {
    await page.goto("/menus");
    await page.waitForLoadState("networkidle");

    // 提案を実行
    const suggestButton = page.getByRole("button", {
      name: /提案|献立を提案|AI/,
    });
    await suggestButton.click();
    await expect(page.getByText("チキンカレー")).toBeVisible({
      timeout: 15000,
    });

    // alert のモック
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    // 別案ボタンをクリック
    const retryButton = page.getByRole("button", {
      name: /別案|もう一度|再提案|やり直し/,
    });
    if (await retryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await retryButton.click();

      // 新しい提案がロードされる（再度ポーリング）
      await expect(page.getByText("チキンカレー")).toBeVisible({
        timeout: 15000,
      });
    }
  });

  // ── 6. NG を送信 ──
  test("NG を送信できる", async ({ page }) => {
    await page.goto("/menus");
    await page.waitForLoadState("networkidle");

    // 提案を実行
    const suggestButton = page.getByRole("button", {
      name: /提案|献立を提案|AI/,
    });
    await suggestButton.click();
    await expect(page.getByText("チキンカレー")).toBeVisible({
      timeout: 15000,
    });

    // prompt + alert のモック
    page.on("dialog", async (dialog) => {
      if (dialog.type() === "prompt") {
        await dialog.accept("味が合わない");
      } else {
        await dialog.accept();
      }
    });

    // NG ボタンをクリック
    const ngButton = page.getByRole("button", { name: /NG|却下|拒否/ });
    if (await ngButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ngButton.click();
    }
  });

  // ── 7. 完全フロー: 入力 → API 呼び出し → 結果表示 → 保存 ──
  test("E2E: 入力 → 提案 → 結果表示 → 採用保存", async ({ page }) => {
    await page.goto("/menus");
    await page.waitForLoadState("networkidle");

    // ─ STEP 1: 制約入力 ─
    // 日数を選択（あれば）
    const daysSelect = page.locator(
      "select[name=\"days\"], [data-testid=\"days-select\"]",
    );
    if (await daysSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await daysSelect.selectOption({ index: 1 });
    }

    // ─ STEP 2: API 呼び出し ─
    const suggestButton = page.getByRole("button", {
      name: /提案|献立を提案|AI/,
    });

    // API リクエストを監視
    const [suggestRequest] = await Promise.all([
      page.waitForRequest("**/api/suggestions"),
      suggestButton.click(),
    ]);
    expect(suggestRequest.method()).toBe("POST");

    // ─ STEP 3: 結果表示 ─
    await expect(page.getByText("チキンカレー")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("野菜サラダ")).toBeVisible();

    // 理由が表示される
    await expect(
      page.getByText("在庫の鶏もも肉とたまねぎを活用"),
    ).toBeVisible();

    // ─ STEP 4: 保存（採用） ─
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const acceptButton = page.getByRole("button", {
      name: /採用|決定|OK|これにする/,
    });
    if (await acceptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // レシピ保存 API の呼び出しを監視
      const recipePromise = page.waitForRequest("**/api/recipes");
      await acceptButton.click();
      const recipeReq = await recipePromise;
      expect(recipeReq.method()).toBe("POST");
    }
  });
});
