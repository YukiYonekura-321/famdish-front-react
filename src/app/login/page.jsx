"use client";

import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  //   signInWithRedirect,
  signInWithPopup,
  //   getRedirectResult,
  //   onAuthStateChanged,
  getAdditionalUserInfo,
} from "firebase/auth";
import { apiClient } from "@/app/lib/api";
import { useState, useEffect } from "react";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import Link from "next/link";

// リダイレクト先がアプリ内の安全なパスか検証
const isValidRedirectPath = (path) => {
  if (!path) return false;
  // 外部 URL や プロトコル付きは拒否
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//")
  ) {
    return false;
  }
  // アプリ内パス（/で始まる）のみ許可
  return path.startsWith("/");
};

export default function LoginPage() {
  const router = useRouter();
  const [redirectParam, setRedirectParam] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectParam(params.get("redirect"));
  }, []);

  const redirectTomyPageWhenLoginSuccess = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const additional = getAdditionalUserInfo(result); // 正規の取得方法
      console.log("additionalUserInfo:", additional);
      const isNewUser = additional?.isNewUser;

      // リダイレクト先を決定（redirect param があれば優先）
      let targetPath = "/menus";

      if (isNewUser) {
        // 新規登録ユーザーはプロフィールステップへ
        targetPath = "/profile/step1";
      } else {
        // isNewUser = falseの場合でも、本登録状況を確認する
        // サーバ側で member が紐付いていれば本登録とみなし /menus へリダイレクト
        try {
          const res = await apiClient.get("/api/members/me");
          if (res?.data?.username) {
            // 本登録済み
            targetPath = "/menus";
          } else {
            targetPath = "/profile/step1";
          }
        } catch (err) {
          console.error("member/me check failed", err);
          targetPath = "/profile/step1";
        }
      }

      // ⭐ メール未認証は最優先（redirect パラメータより優先）
      if (!result.user.emailVerified) {
        // メール未認証かつ redirect パラメータがある場合は、それを /register-email に渡す
        if (isValidRedirectPath(redirectParam)) {
          targetPath = `/register-email?redirect=${encodeURIComponent(redirectParam)}`;
        } else {
          targetPath = "/register-email";
        }
      } else if (isValidRedirectPath(redirectParam)) {
        // メール認証済み かつ redirect パラメータがある場合のみ redirect を使用
        targetPath = redirectParam;
      }

      router.replace(targetPath);
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
  //   useEffect(() => {
  //     redirect 結果の取得
  //     getRedirectResult(auth)
  //       .then((result) => {
  //         console.log("getRedirectResult ->", result);
  //         if (result?.user) {
  //           console.log("✅ Redirect login success:", result.user);
  //           // ログイン成功 → ページ遷移
  //           router.replace("/members"); // 遷移先を適宜変更
  //         } else {
  //           console.log("ℹ️ No redirect result");
  //         }
  //       })
  //       .catch((err) => console.error("❌ Redirect error", err));
  //     const unsub = onAuthStateChanged(auth, (u) =>
  //       console.log("onAuthStateChanged ->", u),
  //     );
  //     console.log("auth redirectUser:", auth.redirectUser);
  //     console.log(
  //       "localStorage redirect key:",
  //       localStorage.getItem(
  //         "firebase:redirectUser:AIzaSyAmSNvwCiw2fNXzH_yRzbxmb3bNpnHmeJQ:[DEFAULT]",
  //       ),
  //     );
  //     console.log(
  //       "localStorage auth key:",
  //       localStorage.getItem(
  //         "firebase:authUser:AIzaSyAmSNvwCiw2fNXzH_yRzbxmb3bNpnHmeJQ:[DEFAULT]",
  //       ),
  //     );
  //     return () => unsub();
  //   }, [router]);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="luxury-page flex items-center justify-center min-h-screen">
        <div className="luxury-card max-w-md w-full mx-auto animate-fade-in-up">
          <h1
            className="text-4xl md:text-5xl font-medium text-center mb-8 text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ログイン
          </h1>

          <div className="w-16 h-1 bg-gradient-to-r from-[var(--sage-400)] to-[var(--sage-600)] mx-auto mb-10"></div>

          <div className="space-y-4">
            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-2xl transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              onClick={() => {
                googleLogin();
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Googleでログイン</span>
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-2xl transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              onClick={() => {
                twitterLogin();
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X(Twitter)でログイン</span>
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-2xl transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              onClick={() => {
                githubLogin();
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Githubでログイン</span>
            </button>
          </div>

          <div className="mt-8">
            <Link
              href="/recovery"
              className="block text-center text-sm text-muted hover:text-[var(--primary)] transition-colors"
            >
              ソーシャルログインできない場合はこちら
            </Link>
          </div>

          <div className="divider"></div>

          <p className="text-center text-sm">
            アカウントをお持ちでない方は{" "}
            <Link
              href="/sign-in"
              className="text-[var(--primary)] hover:text-[var(--primary-hover)] underline underline-offset-4 font-medium transition-colors"
            >
              会員登録はこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
