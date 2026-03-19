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
 * シンプルな addInitScript アプローチ:
 * 1. Firebase SDK ロード完了を待つ
 * 2. connectAuthEmulator() を呼び出す
 * 3. グローバルヘルパー関数を定義
 */
export async function connectBrowserToEmulator(page) {
  const emulatorUrl = `http://${EMULATOR_HOST}`;

  // Firebase SDK ロード完了を待つ & Emulator 接続
  await page.addInitScript(
    ({ emulatorUrl }) => {
      const maxAttempts = 100;
      let attempts = 0;

      const waitForFirebase = setInterval(() => {
        attempts++;

        // Firebase SDK が利用可能か判定
        let hasFirebase = false;
        let auth = null;

        try {
          // パターン1: Next.js の firebase setup で getAuth() を使用
          if (
            typeof window !== "undefined" &&
            window.firebase &&
            typeof window.firebase.auth === "function"
          ) {
            // compat API
            auth = window.firebase.auth();
            hasFirebase = true;
          }
          // パターン2: モダン SDK (firebase/auth モジュール から)
          else if (window.__firebaseAuth__) {
            auth = window.__firebaseAuth__;
            hasFirebase = true;
          }
          // パターン3: グローバル探索
          else {
            for (const key in window) {
              const val = window[key];
              if (
                val &&
                typeof val === "object" &&
                typeof val.currentUser !== "undefined"
              ) {
                auth = val;
                hasFirebase = true;
                break;
              }
            }
          }
        } catch (e) {
          // 無視
        }

        if (!hasFirebase && attempts < maxAttempts) {
          if (attempts % 10 === 1) {
            console.log(`[E2E] Polling Firebase SDK... attempt ${attempts}`);
          }
          return; // 未ロード、次回ポーリング
        }

        clearInterval(waitForFirebase);

        if (!hasFirebase) {
          console.warn(
            `[E2E] Firebase SDK not detected after ${attempts} attempts`,
          );
          return;
        }

        try {
          console.log(
            `[E2E] Firebase SDK detected at attempt ${attempts}`,
          );

          // connectAuthEmulator 関数を探す
          let connectAuthEmulator = null;

          // パターン1: firebase.auth API
          if (
            window.firebase &&
            typeof window.firebase.auth === "object" &&
            window.firebase.auth.connectAuthEmulator
          ) {
            connectAuthEmulator = window.firebase.auth.connectAuthEmulator;
          }
          // パターン2: 直接インポート (モダン SDK)
          else if (window.__firebaseConnect__) {
            connectAuthEmulator = window.__firebaseConnect__;
          }

          // Emulator 接続
          if (connectAuthEmulator && auth) {
            connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true });
            console.log("[E2E] connectAuthEmulator succeeded");
          } else {
            console.warn(
              "[E2E] connectAuthEmulator not available or auth missing",
            );
          }

          // グローバルヘルパー関数を定義
          window.__FIREBASE_AUTH__ = auth;

          // signInWithEmailAndPassword
          window.__FIREBASE_SIGN_IN__ = async function (email, password) {
            try {
              console.log("[E2E] signInWithEmailAndPassword called");
              // compat API を優先
              if (
                window.firebase &&
                typeof window.firebase.auth === "function"
              ) {
                const authCompat = window.firebase.auth();
                return await authCompat.signInWithEmailAndPassword(
                  email,
                  password,
                );
              }
              // モダン API
              else if (auth && auth.signInWithEmailAndPassword) {
                return await auth.signInWithEmailAndPassword(email, password);
              } else {
                throw new Error("signInWithEmailAndPassword not available");
              }
            } catch (e) {
              console.error("[E2E] signIn error:", e.message);
              throw e;
            }
          };

          // signOut
          window.__FIREBASE_SIGN_OUT__ = async function () {
            try {
              if (
                window.firebase &&
                typeof window.firebase.auth === "function"
              ) {
                return await window.firebase.auth().signOut();
              } else if (auth && auth.signOut) {
                return await auth.signOut();
              } else {
                throw new Error("signOut not available");
              }
            } catch (e) {
              console.error("[E2E] signOut error:", e.message);
              throw e;
            }
          };

          console.log("[E2E] Firebase Emulator bridge setup complete");
        } catch (e) {
          console.error("[E2E] Setup failed:", e.message);
        }
      }, 100);

      // タイムアウト設定（10秒以상 待たない）
      setTimeout(() => {
        clearInterval(waitForFirebase);
      }, 10000);
    },
    { emulatorUrl },
  );
}
