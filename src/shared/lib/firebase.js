"use client";

// Firebaseアプリを初期化するための関数 initializeApp をインポート
import { initializeApp } from "firebase/app";
// Firebaseの**認証機能（Authentication）**を使うための関数 getAuth をインポート
import { getAuth } from "firebase/auth";
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
}

// 初期化したアプリから認証機能を取得して、auth という名前で外部に使えるようにしています。
// 他のファイルで auth を使えば、ログイン・ログアウトなどの処理ができます
export { auth };

// setPersistence(auth, browserLocalPersistence)
//   .then(() => {
//     console.log("✅ Firebase persistence: local");
//   })
//   .catch((err) => {
//     console.error("❌ persistence error", err);
//   });
