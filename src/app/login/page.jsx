"use client";

// Firebaseの認証機能から、Googleログインに必要な機能をインポート
// GoogleAuthProvider: Googleログイン用のプロバイダー。
// signInWithPopup: ポップアップ画面でログイン処理を行う関数。
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// lib/firebase.ts で初期化した Firebase 認証オブジェクト auth をインポート。これを使ってログイン処理を実行
import { auth } from "../lib/firebase";

// GoogleAuthProvider() を使って Googleログイン用のプロバイダーを作成。
// signInWithPopup(auth, provider) で、ポップアップを表示してログインを実行。
// await を使って、ログインが完了するまで待機。
const login = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

// LoginPage というReactコンポーネントを定義
// ボタンを表示して、クリックすると login 関数が呼ばれ、Googleログイン開始
export default function LoginPage() {
  return <button onClick={login}>Googleでログイン</button>;
}


