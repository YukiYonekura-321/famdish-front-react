"use client";

// Firebaseの認証機能から、Googleログインに必要な機能をインポート
// GoogleAuthProvider: Googleログイン用のプロバイダー。
// signInWithPopup: ポップアップ画面でログイン処理を行う関数。
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
// lib/firebase.ts で初期化した Firebase 認証オブジェクト auth をインポート。これを使ってログイン処理を実行
import { auth } from "./lib/firebase";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

// GoogleAuthProvider() を使って Googleログイン用のプロバイダーを作成。
// signInWithPopup(auth, provider) で、ポップアップを表示してログインを実行。
// await を使って、ログインが完了するまで待機。
const login = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
};

// LoginPage というReactコンポーネントを定義
// ボタンを表示して、クリックすると login 関数が呼ばれ、Googleログイン開始
export default function LoginPage() {
  return (
    <div>
      <Header />

      <div className="flex justify-center mt-4">
        <h1 className="text-2xl font-bold">食卓で家族は繋がる</h1>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={login}
        >
          Googleでログイン
        </button>
      </div>

      <Footer />
    </div>
  );
  // return <button onClick={login}>Googleでログイン</button>;
}
