/**
 * E2E テスト用 Fixtures & ヘルパー
 *
 * - Firebase Auth Emulator への接続
 * - バックエンド API モック用ヘルパー
 * - 共通ページ操作
 */
import { test as base, expect } from "@playwright/test";

// ── テスト用固定データ ──────────────────────────
export const TEST_USER = {
  uid: "e2e-test-uid-001",
  email: "e2e@famdish.test",
  displayName: "E2E テストユーザー",
  emailVerified: true,
};

export const TEST_MEMBER = {
  id: 1,
  username: "e2e_user",
  name: "E2Eテスト",
  /* eslint-disable-next-line camelcase */
  family_id: 1,
};

export const TEST_FAMILY = {
  id: 1,
  /* eslint-disable-next-line camelcase */
  family_name: "E2Eファミリー",
  /* eslint-disable-next-line camelcase */
  today_cook_id: 1,
};

// ── API モック用レスポンス ─────────────────────
export const MOCK_RESPONSES = {
  // GET /api/members/me
  memberMe: {
    member: TEST_MEMBER,
    username: TEST_MEMBER.username,
  },

  // GET /api/members
  members: [TEST_MEMBER],

  // GET /api/families
  families: TEST_FAMILY,

  // GET /api/stocks
  stocks: [
    { id: 1, name: "にんじん", quantity: 3, unit: "本" },
    { id: 2, name: "たまねぎ", quantity: 2, unit: "個" },
    { id: 3, name: "鶏もも肉", quantity: 300, unit: "g" },
  ],

  // POST /api/suggestions → completed レスポンス
  suggestionCreated: {
    id: 100,
    status: "processing",
  },
  suggestionCompleted: {
    id: 100,
    status: "completed",
    /* eslint-disable-next-line camelcase */
    suggest_field: [
      {
        title: "チキンカレー",
        reason: "在庫の鶏もも肉とたまねぎを活用",
        ingredients: ["鶏もも肉", "たまねぎ", "にんじん", "カレー粉"],
        time: 40,
        budget: 800,
      },
      {
        title: "野菜サラダ",
        reason: "栄養バランスを考慮",
        ingredients: ["にんじん", "レタス"],
        time: 10,
        budget: 300,
      },
    ],
  },

  // POST /api/recipes
  recipeCreated: {
    id: 1,
    /* eslint-disable-next-line camelcase */
    dish_name: "チキンカレー",
    /* eslint-disable-next-line camelcase */
    suggestion_id: 100,
  },
};

// ── Firebase Auth を Emulator に接続（認証済み状態） ──
/**
 * ブラウザを Firebase Auth Emulator に接続し、テストユーザーでサインインする。
 *
 * 1. Emulator にテストユーザーを確保
 * 2. Turbopack チャンクインターセプトをセットアップ
 * 3. /sign-in へ遷移して Firebase チャンクを読み込み
 * 4. signInWithEmailAndPassword でサインインを完了
 *
 * この関数完了後、Firebase SDK は認証済み状態になる。
 */
export async function mockFirebaseAuth(page) {
  const { connectBrowserToEmulator, createEmulatorUser } = await import(
    "./emulator.js"
  );

  // Emulator にテストユーザーを確保
  await createEmulatorUser({
    email: TEST_USER.email,
    password: "Test1234!",
    displayName: TEST_USER.displayName,
    emailVerified: TEST_USER.emailVerified,
  });

  // ページロード時に auth.currentUser を偽装するための認証情報を注入
  // /sign-in ページではサインインフローを妨げないようスキップ
  await page.addInitScript(
    ({ email, password, uid, displayName }) => {
      if (window.location.pathname === "/sign-in") return;
      window.__E2E_CREDENTIALS__ = { email, password, uid, displayName };
    },
    {
      email: TEST_USER.email,
      password: "Test1234!",
      uid: TEST_USER.uid,
      displayName: TEST_USER.displayName,
    },
  );

  // Turbopack チャンクインターセプトをセットアップ
  await connectBrowserToEmulator(page);

  // /sign-in へ遷移して Firebase チャンクを読み込み
  await page.goto("/sign-in");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");

  // 診断: ブラウザ側のコンソール出力
  page.on("console", (msg) => {
    if (msg.text().includes("[E2E]")) {
      console.log("[Browser]", msg.text());
    }
  });

  // ページロード完了後、Firebase SDK が利用可能か直接チェック
  const firebaseNowAvailable = await page.evaluate(() => {
    let hasFirebase = false;
    try {
      if (
        typeof window.firebase !== "undefined" &&
        typeof window.firebase.auth === "function"
      ) {
        hasFirebase = true;
      } else if (typeof window.__firebaseAuth__ !== "undefined") {
        hasFirebase = true;
      }
    } catch (e) {}

    console.log("[E2E] After page load, Firebase available:", hasFirebase);
    return hasFirebase;
  });

  // Firebase SDK が読み込まれるのを待つ（主に addInitScript のポーリングを監視）
  try {
    await page.waitForFunction(
      () => {
        const has = typeof window.__FIREBASE_SIGN_IN__ === "function";
        if (!has && typeof window.__FIREBASE_SETUP_CHECKED__ === "undefined") {
          console.log(
            "[E2E Check]",
            "Waiting for __FIREBASE_SIGN_IN__. hasFirebase:",
            typeof window.firebase,
            "hasAuth:",
            typeof window.__FIREBASE_AUTH__,
          );
        }
        window.__FIREBASE_SETUP_CHECKED__ = true;
        return has;
      },
      { timeout: 60000 }, // 60秒
    );
  } catch (e) {
    // タイムアウト時のデバッグ情報を出力
    const debugInfo = await page.evaluate(() => {
      return {
        hasSignIn: typeof window.__FIREBASE_SIGN_IN__ === "function",
        hasAuth: typeof window.__FIREBASE_AUTH__ !== "undefined",
        hasFirebase: typeof window.firebase !== "undefined",
        windowFirebaseKeys: Object.keys(window)
          .filter(
            (k) =>
              k.includes("FIREBASE") ||
              k.includes("firebase") ||
              k.includes("auth"),
          )
          .slice(0, 10),
      };
    });
    console.error("[E2E Error] Firebase setup failed:", debugInfo);
    throw e;
  }

  // 実際にサインインを完了させる
  await page.evaluate(
    async ({ email, password }) => {
      await window.__FIREBASE_SIGN_IN__(email, password);
    },
    { email: TEST_USER.email, password: "Test1234!" },
  );

  // サインイン後のナビゲーション
  try {
    await page.waitForURL((url) => !url.pathname.includes("/sign-in"), {
      timeout: 5000,
    });
    await page.waitForLoadState("domcontentloaded");
  } catch {
    // リダイレクトなし
  }
}

/**
 * バックエンド API をルートハンドラでモックする。
 * page.route() で API リクエストをインターセプトし、固定レスポンスを返す。
 */
export async function mockBackendApi(page, overrides = {}) {
  const responses = { ...MOCK_RESPONSES, ...overrides };

  // GET /api/members/me
  await page.route("**/api/members/me", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(responses.memberMe),
      });
    }
    return route.fulfill({ status: 204 });
  });

  // GET /api/members
  await page.route("**/api/members", (route) => {
    if (
      route.request().method() === "GET" &&
      !route.request().url().includes("/me")
    ) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(responses.members),
      });
    }
    return route.fulfill({ status: 204 });
  });

  // GET /api/families
  await page.route("**/api/families", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(responses.families),
      });
    }
    return route.fulfill({ status: 204 });
  });

  // GET /api/stocks
  await page.route("**/api/stocks", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(responses.stocks),
      });
    }
    return route.fulfill({ status: 204 });
  });
}

/**
 * AI 提案 API のモック（ポーリング含む）
 */
export async function mockSuggestionApi(page, overrides = {}) {
  const responses = { ...MOCK_RESPONSES, ...overrides };
  let pollCount = 0;

  // POST /api/suggestions
  await page.route("**/api/suggestions", (route) => {
    if (route.request().method() === "POST") {
      pollCount = 0;
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(responses.suggestionCreated),
      });
    }
    return route.fulfill({ status: 204 });
  });

  // GET /api/suggestions/:id（ポーリング: 2回目で completed を返す）
  await page.route("**/api/suggestions/*", (route) => {
    if (route.request().method() === "GET") {
      pollCount++;
      const body =
        pollCount >= 2
          ? responses.suggestionCompleted
          : responses.suggestionCreated;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    }
    return route.fulfill({ status: 204 });
  });

  // POST /api/suggestions/:id/feedback
  await page.route("**/api/suggestions/*/feedback", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    }
    return route.fulfill({ status: 204 });
  });

  // POST /api/recipes
  await page.route("**/api/recipes", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(responses.recipeCreated),
      });
    }
    return route.fulfill({ status: 204 });
  });
}

// ── Extended test fixture ──────────────────────

export const test = base.extend({
  /**
   * authenticatedPage: Firebase 認証 + API モック済みの Page
   */
  authenticatedPage: async ({ page }, use) => {
    await mockFirebaseAuth(page);
    await mockBackendApi(page);
    await use(page);
  },
});

export { expect };
