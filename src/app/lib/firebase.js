"use client";

// Firebaseアプリを初期化するための関数 initializeApp をインポート
import { initializeApp } from "firebase/app";
// Firebaseの**認証機能（Authentication）**を使うための関数 getAuth をインポート
import { getAuth } from "firebase/auth";

import { setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  /* Firebaseの設定情報 */
  apiKey: "AIzaSyAmSNvwCiw2fNXzH_yRzbxmb3bNpnHmeJQ",
  authDomain:
    process.env.NODE_ENV === "production"
      ? "app.famdish.jp" // 本番ドメイン
      : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        "famdish-6f806.firebaseapp.com", // 開発ドメイン（envがあれば優先）
  projectId: "famdish-6f806",
  storageBucket: "famdish-6f806.firebasestorage.app",
  messagingSenderId: "595471367531",
  appId: "1:595471367531:web:2f416bd203d20df01be02e",
};
// 上で用意した設定情報を使って、Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);
// 初期化したアプリから認証機能を取得して、auth という名前で外部に使えるようにしています。
// 他のファイルで auth を使えば、ログイン・ログアウトなどの処理ができます
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Firebase persistence: local");
  })
  .catch((err) => {
    console.error("❌ persistence error", err);
  });
