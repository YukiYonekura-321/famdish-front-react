"use client";

// Firebaseアプリを初期化するための関数 initializeApp をインポート
import { initializeApp } from "firebase/app";
// Firebaseの**認証機能（Authentication）**を使うための関数 getAuth をインポート
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
// import { setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  /* Firebaseの設定情報 */
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.NODE_ENV === "production"
      ? "famdish-6f806.web.app"
      : "famdish-6f806.firebaseapp.com", // 開発ドメイン（envがあれば優先）
  projectId: "famdish-6f806",
  storageBucket: "famdish-6f806.firebasestorage.app",
  messagingSenderId: "595471367531",
  appId: "1:595471367531:web:2f416bd203d20df01be02e",
};

// クライアントサイドのみで初期化（SSRでは実行されない）
let app;
let auth;

if (typeof window !== "undefined") {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // ── E2E テスト用ブリッジ ──
  // Playwright の addInitScript で window.__E2E_EMULATOR_URL__ が設定されている場合、
  // Firebase Auth Emulator に接続し、テスト用ヘルパーを window に公開する。
  // プロダクション環境では window.__E2E_EMULATOR_URL__ は undefined なので一切影響しない。
  //
  // ★ connectAuthEmulator は onAuthStateChanged より先に同期で呼ぶ必要がある。
  //   動的 import() を使うと非同期になり、コンポーネントの onAuthStateChanged が
  //   先に発火して未認証→リダイレクトが起きるため、静的 import を使う。
  if (window.__E2E_EMULATOR_URL__) {
    try {
      connectAuthEmulator(auth, window.__E2E_EMULATOR_URL__, {
        disableWarnings: true,
      });
      console.log("[E2E] connectAuthEmulator succeeded");
    } catch (e) {
      console.warn("[E2E] connectAuthEmulator skipped:", e.message);
    }

    // テストから page.evaluate() 経由で呼び出すヘルパー
    window.__FIREBASE_AUTH__ = auth;
    window.__FIREBASE_SIGN_IN__ = (email, password) =>
      signInWithEmailAndPassword(auth, email, password);
    window.__FIREBASE_SIGN_OUT__ = () => signOut(auth);

    // currentUser 偽装（useEffect の同期チェック回避）
    if (window.__E2E_CREDENTIALS__) {
      try {
        Object.defineProperty(auth, "currentUser", {
          value: {
            uid: window.__E2E_CREDENTIALS__.uid || "e2e-uid",
            email: window.__E2E_CREDENTIALS__.email,
            emailVerified: true,
            displayName: window.__E2E_CREDENTIALS__.displayName || "",
            getIdToken: () => Promise.resolve("e2e-fake-token"),
            getIdTokenResult: () =>
              Promise.resolve({ token: "e2e-fake-token", claims: {} }),
            _stopProactiveRefresh: () => {},
            _startProactiveRefresh: () => {},
            toJSON: function () {
              return { uid: this.uid, email: this.email };
            },
          },
          writable: true,
          configurable: true,
        });
      } catch (e) {
        console.warn("[E2E] currentUser override:", e);
      }
    }

    console.log("[E2E] Firebase Emulator bridge ready");
  }
}

// 初期化したアプリから認証機能を取得して、auth という名前で外部に使えるようにしています。
// 他のファイルで auth を使えば、ログイン・ログアウトなどの処理ができます
export { auth };
