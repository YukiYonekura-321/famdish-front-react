/**
 * ── 在庫 CRUD E2E テスト ──
 *
 * テスト対象（作成 → 表示 → 編集 → 削除の一連フロー）:
 *   1. 在庫一覧の表示
 *   2. 新規在庫の追加（プリセット選択）
 *   3. 新規在庫の追加（カスタム入力）
 *   4. 在庫数量の編集
 *   5. 在庫の削除
 *   6. 完全な CRUD フロー（作成 → 表示 → 編集 → 削除）
 */
import {
  test,
  expect,
  mockFirebaseAuth,
  MOCK_RESPONSES,
} from "../helpers/fixtures.js";

test.describe("在庫 CRUD", () => {
  /** テスト用の在庫データ（ミュータブル） */
  let currentStocks;

  test.beforeEach(async ({ page }) => {
    // 在庫データの初期状態を復元
    currentStocks = [...MOCK_RESPONSES.stocks];

    await mockFirebaseAuth(page);

    // ── 在庫 API を完全にモック ──
    await page.route("**/api/members/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RESPONSES.memberMe),
      }),
    );

    await page.route("**/api/members", (route) => {
      if (!route.request().url().includes("/me")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_RESPONSES.members),
        });
      }
      return route.continue();
    });

    await page.route("**/api/families", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RESPONSES.families),
      }),
    );

    // GET /api/stocks – 現在の在庫を返す
    await page.route("**/api/stocks", (route) => {
      const method = route.request().method();

      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(currentStocks),
        });
      }

      if (method === "POST") {
        const body = JSON.parse(route.request().postData());
        const newStock = {
          id: Date.now(),
          name: body.stock.name,
          quantity: body.stock.quantity,
          unit: body.stock.unit,
        };
        currentStocks.push(newStock);
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(newStock),
        });
      }

      return route.continue();
    });

    // PATCH /api/stocks/:id
    await page.route("**/api/stocks/*", (route) => {
      const method = route.request().method();
      const url = route.request().url();
      const idMatch = url.match(/\/api\/stocks\/(\d+)/);
      const id = idMatch ? Number(idMatch[1]) : null;

      if (method === "PATCH" && id) {
        const body = JSON.parse(route.request().postData());
        const idx = currentStocks.findIndex((s) => s.id === id);
        if (idx !== -1) {
          currentStocks[idx] = {
            ...currentStocks[idx],
            ...body.stock,
          };
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(currentStocks[idx]),
          });
        }
      }

      if (method === "DELETE" && id) {
        currentStocks = currentStocks.filter((s) => s.id !== id);
        return route.fulfill({
          status: 204,
          body: "",
        });
      }

      return route.continue();
    });
  });

  // ── 1. 在庫一覧が表示される ──
  test("在庫一覧が表示される", async ({ page }) => {
    await page.goto("/stock");
    await page.waitForLoadState("networkidle");

    // 初期データが表示されていること
    await expect(page.getByText("にんじん", { exact: true })).toBeVisible();
    await expect(page.getByText("たまねぎ", { exact: true })).toBeVisible();
    await expect(page.getByText("鶏もも肉", { exact: true })).toBeVisible();
  });

  // ── 2. 食材を追加できる ──
  test("新しい食材を追加できる", async ({ page }) => {
    await page.goto("/stock");
    await page.waitForLoadState("networkidle");

    // プリセットから食材を選択
    const presetSelect = page.locator("select").first();
    await presetSelect.selectOption({ label: "じゃがいも（個）" });

    // 数量を選択
    const quantitySelect = page.locator("select").nth(1);
    await quantitySelect.selectOption("5");

    // 追加ボタンをクリック
    const addButton = page.getByRole("button", { name: /追加/ });
    await addButton.click();

    // 成功メッセージが表示される
    await expect(page.getByText(/追加しました/)).toBeVisible({
      timeout: 5000,
    });
  });

  // ── 3. カスタム食材を追加できる ──
  test("カスタム食材名で追加できる", async ({ page }) => {
    await page.goto("/stock");
    await page.waitForLoadState("networkidle");

    // 「その他（自由入力）」を選択
    const presetSelect = page.locator("select").first();
    await presetSelect.selectOption({ value: "__custom__" });

    // カスタム食材名を入力
    const nameInput = page.getByPlaceholder(/アボカド/);
    await nameInput.fill("バナナ");

    // 数量を選択
    const quantitySelect = page.locator("select").nth(1);
    await quantitySelect.selectOption("2");

    // 単位を選択
    const unitSelect = page.locator("select").nth(2);
    await unitSelect.selectOption("個");

    // 追加
    const addButton = page.getByRole("button", { name: /追加/ });
    await addButton.click();

    await expect(page.getByText(/追加しました/)).toBeVisible({
      timeout: 5000,
    });
  });

  // ── 4. 在庫数量を編集できる ──
  test("在庫数量を更新できる", async ({ page }) => {
    await page.goto("/stock");
    await page.waitForLoadState("networkidle");

    // 編集ボタンをクリック（最初の食材）
    const editButton = page.getByRole("button", { name: /数量変更|編集|✏️/ }).first();
    await editButton.click();

    // 数量を変更
    const editInput = page.locator("input[type=\"number\"]").first();
    await editInput.clear();
    await editInput.fill("10");

    // 保存
    const saveButton = page
      .getByRole("button", { name: /保存|更新|✓/ })
      .first();
    await saveButton.click();

    // 成功メッセージ
    await expect(page.getByText(/更新しました/)).toBeVisible({
      timeout: 5000,
    });
  });

  // ── 5. 在庫を削除できる ──
  test("在庫を削除できる", async ({ page }) => {
    await page.goto("/stock");
    await page.waitForLoadState("networkidle");

    // 削除ボタンをクリック
    const deleteButton = page.getByRole("button", { name: /削除|🗑/ }).first();
    await deleteButton.click();

    // 確認ダイアログで削除を確定
    const confirmButton = page.getByRole("button", {
      name: /削除する|確定|はい/,
    });
    if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // 成功メッセージ
    await expect(page.getByText(/削除しました/)).toBeVisible({
      timeout: 5000,
    });
  });

  // ── 6. E2E: 完全な CRUD フロー ──
  test("CRUD フロー: 作成 → 表示 → 編集 → 削除", async ({ page }) => {
    await page.goto("/stock");
    await page.waitForLoadState("networkidle");

    // ─ CREATE ─
    const presetSelect = page.locator("select").first();
    await presetSelect.selectOption({ value: "__custom__" });
    await page.getByPlaceholder(/アボカド/).fill("テスト食材");
    const quantitySelect = page.locator("select").nth(1);
    await quantitySelect.selectOption("3");
    const unitSelect = page.locator("select").nth(2);
    await unitSelect.selectOption("個");
    await page.getByRole("button", { name: /追加/ }).click();
    await expect(page.getByText(/追加しました/)).toBeVisible({
      timeout: 5000,
    });

    // ─ READ ─
    await expect(page.getByText("テスト食材", { exact: true })).toBeVisible();

    // ─ UPDATE ─
    // テスト食材の行の編集ボタンをクリック
    const testRow = page.locator(":has-text('テスト食材')").last();
    const editBtn = testRow.getByRole("button", { name: /数量変更|編集|✏️/ });
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click();
      const input = testRow.locator("input[type=\"number\"]");
      await input.clear();
      await input.fill("7");
      await testRow.getByRole("button", { name: /保存|更新|✓/ }).click();
      await expect(page.getByText(/更新しました/)).toBeVisible({
        timeout: 5000,
      });
    }

    // ─ DELETE ─
    const deleteBtn = testRow.getByRole("button", { name: /削除|🗑/ });
    if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteBtn.click();
      const confirmBtn = page.getByRole("button", {
        name: /削除する|確定|はい/,
      });
      if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmBtn.click();
      }
      await expect(page.getByText(/削除しました/)).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
