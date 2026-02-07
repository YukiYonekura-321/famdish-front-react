"use client";

import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  // ログイン済みなら新規登録ページに来ても /menus にリダイレクト
  useEffect(() => {
    // 既に認証済みの場合は即時リダイレクト
    if (auth.currentUser) {
      router.replace("/menus");
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/menus");
        console.log("onAuthStateChanged user:", user);
        console.log("calling replace");
      }
    });
    return () => unsub();
  }, [router]);

  const redirectTomyPageWhenLoginSuccess = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const additional = getAdditionalUserInfo(result); // 正規の取得方法
      console.log("additionalUserInfo:", additional);
      const isNewUser = additional?.isNewUser;
      if (isNewUser) {
        // 新規登録ユーザーはプロフィールステップへ
        router.replace("/profile/step1");
      } else {
        // 既存ユーザーはメニュー一覧へ
        router.replace("/menus");
      }
      // メールが確認されていない場合はメール登録画面に遷移する
      if (!result.user.emailVerified) {
        router.replace("/register-email");
      }
    } catch (error) {
      console.log(error);
      console.log(
        error.code,
        error.message,
        error.credential,
        error.customData,
      );
      alert(`エラー: ${error.code} ${error.message}`);
      if (error.code === "auth/account-exists-with-different-credential") {
        alert(
          `${error.customData.email}は他のSNSと連携した既存ユーザーが登録済みです。既存ユーザーでログイン後、こちらのSNSとの連携が可能です。`,
        );
        return;
      }
      alert(`ログイン/新規登録に失敗しました。\n${error.message}`);
    }
  };

  // Googleログインボタン
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await redirectTomyPageWhenLoginSuccess(provider);
  };

  // X(twitter)ログインボタン
  const twitterLogin = async () => {
    const provider = new TwitterAuthProvider();
    await redirectTomyPageWhenLoginSuccess(provider);
  };

  // GitHubログインボタン
  const githubLogin = async () => {
    const provider = new GithubAuthProvider();
    await redirectTomyPageWhenLoginSuccess(provider);
  };
  return (
    <div>
      <Header />

      <div className="relative w-full min-h-screen p-8">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex flex-col items-centertext-center space-y-6">
          <h1 className="text-3xl md:text-6xl font-bold text-black drop-shadow-lg">
            会員登録
          </h1>

          <button
            className="px-4 py-2 inline-block bg-blue-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              googleLogin();
            }}
          >
            Googleで新規登録
          </button>

          <button
            className="px-4 py-2 inline-block bg-sky-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              twitterLogin();
            }}
          >
            X(Twitter)で新規登録
          </button>

          <button
            className="px-4 py-2 inline-block bg-gray-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              githubLogin();
            }}
          >
            Githubで新規登録
          </button>

          <p className="md:text-xl hover:opacity-80 transition">
            新規登録できない場合はSNSアカウントを作成
            <br className="hidden md:block" />
            してください
          </p>

          <p className="md:text-xl mt-6 text-sm">
            アカウントをお持ちの方
            <br />
            <Link
              href="/login"
              className="md:text-xl underline underline-offset-4 hover:opacity-80 transition"
            >
              ログインはこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
