"use client";

// Firebaseの認証機能から、Googleログインに必要な機能をインポート
// GoogleAuthProvider: Googleログイン用のプロバイダー。
// signInWithPopup: ポップアップ画面でログイン処理を行う関数。
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
// lib/firebase.ts で初期化した Firebase 認証オブジェクト auth をインポート。これを使ってログイン処理を実行
import { auth } from "./lib/firebase";
import { Header } from "../components/header";
import { useEffect, useState } from "react";
import { getRedirectResult } from "firebase/auth";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

// GoogleAuthProvider() を使って Googleログイン用のプロバイダーを作成。
// signInWithPopup(auth, provider) で、ポップアップを表示してログインを実行。
// await を使って、ログインが完了するまで待機。
const login = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
};

const bgImages = [
  "/32997476_m.jpg",
  "/istockphoto-480432438-612x612.jpg",
  "/istockphoto-1442729474-612x612.jpg",
];

export default function LoginPage() {
  const router = useRouter();
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000); // 5秒ごとに切り替え

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // redirect 結果の取得
    getRedirectResult(auth)
      .then((result) => {
        console.log("getRedirectResult ->", result);
        if (result?.user) {
          console.log("✅ Redirect login success:", result.user);
          // ログイン成功 → ページ遷移
          router.replace("/members"); // 遷移先を適宜変更
        } else {
          console.log("ℹ️ No redirect result");
        }
      })
      .catch((err) => console.error("❌ Redirect error", err));
    const unsub = onAuthStateChanged(auth, (u) =>
      console.log("onAuthStateChanged ->", u),
    );
    console.log("auth redirectUser:", auth.redirectUser);
    console.log(
      "localStorage redirect key:",
      localStorage.getItem(
        "firebase:redirectUser:AIzaSyAmSNvwCiw2fNXzH_yRzbxmb3bNpnHmeJQ:[DEFAULT]",
      ),
    );
    console.log(
      "localStorage auth key:",
      localStorage.getItem(
        "firebase:authUser:AIzaSyAmSNvwCiw2fNXzH_yRzbxmb3bNpnHmeJQ:[DEFAULT]",
      ),
    );
    return () => unsub();
  }, [router]);

  return (
    <div>
      <Header />

      <div className="relative w-full min-h-screen p-8">
        {/* 背景画像3枚重ねる 画像を重ねないと文字も消えてしまう */}
        {bgImages.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-3000"
            style={{
              backgroundImage: `url(${img})`,
              opacity: idx === bgIndex ? 1 : 0,
            }}
          ></div>
        ))}
        {/* マスク（暗くする） */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex-col text-center space-y-8">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">
            食卓で家族は繋がる
          </h1>

          <button
            className="px-4 py-2 inline-block bg-blue-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              login();
            }}
          >
            Googleでログイン
          </button>
        </div>
      </div>
    </div>
  );
}
