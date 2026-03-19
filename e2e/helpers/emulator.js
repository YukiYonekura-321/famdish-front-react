/**
 * Firebase Auth Emulator ヘルパー
 *
 * Emulator の REST API を使ってユーザーの作成・削除を行い、
 * ブラウザ側では connectAuthEmulator で Emulator に接続する。
 *
 * 使用条件: E2E_USE_EMULATOR=1 が設定されていること
 */

const EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const EMULATOR_URL = `http://${EMULATOR_HOST}`;
const PROJECT_ID = "famdish-6f806";

/**
 * Emulator 上にメール/パスワード ユーザーを作成する
 * @param {{ email: string, password: string, displayName?: string, emailVerified?: boolean }} opts
 * @returns {Promise<{ localId: string, email: string, idToken: string }>}
 */
export async function createEmulatorUser({
  email,
  password,
  displayName = "",
  emailVerified = true,
}) {
  // 1. signUp エンドポイントでユーザー作成
  const signUpRes = await fetch(
    `${EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName,
        returnSecureToken: true,
      }),
    },
  );

  let signUpData;

  if (!signUpRes.ok) {
    const err = await signUpRes.text();
    const errData = JSON.parse(err);

    // EMAIL_EXISTS の場合、ユーザーが既に存在しているので signIn して idToken を取得
    if (errData?.error?.message === "EMAIL_EXISTS") {
      console.log(
        `User ${email} already exists in emulator, updating attributes`,
      );

      // 既存ユーザーでサインイン
      const signInRes = await fetch(
        `${EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        },
      );

      if (!signInRes.ok) {
        throw new Error(
          `Failed to sign in existing user: ${await signInRes.text()}`,
        );
      }

      signUpData = await signInRes.json();
    } else {
      throw new Error(`Failed to create emulator user: ${err}`);
    }
  } else {
    signUpData = await signUpRes.json();
  }

  // 2. emailVerified を設定（新規・既存両対応）
  if (emailVerified !== undefined) {
    const updateRes = await fetch(
      `${EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: signUpData.idToken,
          emailVerified,
        }),
      },
    );

    if (!updateRes.ok) {
      console.warn(
        `Warning: Failed to update emailVerified for ${email}: ${await updateRes.text()}`,
      );
    }
  }

  return {
    localId: signUpData.localId,
    email: signUpData.email,
    idToken: signUpData.idToken,
  };
}

/**
 * Emulator 上にメール/パスワードでサインインする
 * @param {{ email: string, password: string }} opts
 * @returns {Promise<{ localId: string, idToken: string, refreshToken: string }>}
 */
export async function signInEmulatorUser({ email, password }) {
  const res = await fetch(
    `${EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to sign in emulator user: ${err}`);
  }

  return res.json();
}

/**
 * Emulator の全ユーザーを削除する
 */
export async function clearEmulatorUsers() {
  const res = await fetch(
    `${EMULATOR_URL}/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    console.warn(`Failed to clear emulator users: ${res.status}`);
  }
}

/**
 * Emulator がリッスンしているか確認する
 * @returns {Promise<boolean>}
 */
export async function isEmulatorRunning() {
  try {
    const res = await fetch(`${EMULATOR_URL}/`, { method: "GET" });
    return res.ok || res.status === 200;
  } catch {
    return false;
  }
}

/**
 * ブラウザ側で Firebase Auth を Emulator に接続する。
 *
 * Turbopack の共有チャンクをインターセプトし、getAuth() 直後に
 * connectAuthEmulator() を呼び出すコードを注入する。
 * また signInWithEmailAndPassword / signOut をグローバルヘルパーとして公開し、
 * テストから page.evaluate() 経由で呼び出せるようにする。
 */
export async function connectBrowserToEmulator(page) {
  const emulatorUrl = `http://${EMULATOR_HOST}`;

  await page.route(
    /\/_next\/static\/chunks\/src_[a-f0-9]+\._.js/,
    async (route) => {
      try {
        // ページが閉じられている可能性があるため確認
        if (page.isClosed()) {
          return;
        }

        let response;
        try {
          response = await route.fetch();
        } catch (e) {
          // ページ/ブラウザが閉じられた場合はスキップ
          if (
            e.message.includes(
              "Target page, context or browser has been closed",
            )
          ) {
            return;
          }
          throw e;
        }

        let body = await response.text();

        // firebase.js モジュールを含むチャンクのみ改変
        if (body.includes("firebaseConfig") && body.includes('["getAuth"]')) {
          body = body.replace(
            /(auth\s*=\s*\(0,\s*([A-Za-z0-9_$]+)\["getAuth"\]\)\(app\))/,
            (match, _full, mod) =>
              `${match};` +
              // connectAuthEmulator
              `try{(0,${mod}["connectAuthEmulator"])(auth,"${emulatorUrl}",{disableWarnings:true})}` +
              `catch(e){console.warn("Emulator connect skipped:",e.message)};` +
              // signInWithEmailAndPassword をグローバルに公開
              `window.__FIREBASE_SIGN_IN__=function(email,password){` +
              `return (0,${mod}["signInWithEmailAndPassword"])(auth,email,password)};` +
              // signOut をグローバルに公開
              `window.__FIREBASE_SIGN_OUT__=function(){` +
              `return (0,${mod}["signOut"])(auth)};` +
              // auth オブジェクト参照をグローバルに公開
              `window.__FIREBASE_AUTH__=auth;` +
              // ── currentUser 偽装: useEffect の同期チェックを通す ──
              // onAuthStateChanged は IndexedDB からセッションを復元後に発火するが、
              // auth.currentUser の同期チェックは復元前に null になる。
              // 偽ユーザーで上書きし、useEffect のバイルアウトを防ぐ。
              `if(window.__E2E_CREDENTIALS__){` +
              `try{Object.defineProperty(auth,"currentUser",{value:{` +
              `uid:window.__E2E_CREDENTIALS__.uid||"e2e-uid",` +
              `email:window.__E2E_CREDENTIALS__.email,` +
              `emailVerified:true,` +
              `displayName:window.__E2E_CREDENTIALS__.displayName||"",` +
              `getIdToken:function(){return Promise.resolve("e2e-fake-token")},` +
              `getIdTokenResult:function(){return Promise.resolve({token:"e2e-fake-token",claims:{}})},` +
              `_stopProactiveRefresh:function(){},` +
              `_startProactiveRefresh:function(){},` +
              `toJSON:function(){return{uid:this.uid,email:this.email}}` +
              `},writable:true,configurable:true})}catch(e){console.warn("currentUser override:",e)}` +
              `}`,
          );
        }

        await route.fulfill({ body, contentType: "application/javascript" });
      } catch (e) {
        // エラーが発生した場合のハンドリング
        console.error("Route error:", e.message);
        // route.abort() でリクエストをエラーとしてマーク
        try {
          await route.abort("failed");
        } catch (_) {
          // ページが閉じられている場合は無視
        }
      }
    },
  );
}
