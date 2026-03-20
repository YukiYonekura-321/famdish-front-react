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
 * アプリの firebase.js 内のブリッジコードを起動するために
 * addInitScript で window.__E2E_EMULATOR_URL__ を設定する。
 * firebase.js はこのフラグを検出すると、connectAuthEmulator() を呼び出し、
 * window.__FIREBASE_SIGN_IN__ 等のヘルパーを自動公開する。
 */
export async function connectBrowserToEmulator(page) {
  const emulatorUrl = `http://${EMULATOR_HOST}`;

  // firebase.js 内のブリッジコードを起動するフラグを設定
  await page.addInitScript(
    ({ emulatorUrl }) => {
      window.__E2E_EMULATOR_URL__ = emulatorUrl;
    },
    { emulatorUrl },
  );
}
