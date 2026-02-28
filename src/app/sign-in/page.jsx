"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { Header } from "@/shared/components/header";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/menus");
    });
    return () => unsub();
  }, [router]);

  const handleSocialSignIn = useCallback(
    async (provider) => {
      setError("");
      try {
        const result = await signInWithPopup(auth, provider);
        const additional = getAdditionalUserInfo(result);

        if (!result.user.emailVerified) {
          router.replace("/register-email");
          return;
        }

        if (additional?.isNewUser) {
          router.replace("/profile/step1");
        } else {
          router.replace("/menus");
        }
      } catch (err) {
        if (err.code === "auth/account-exists-with-different-credential") {
          setError(
            `${err.customData?.email}は他のSNSと連携した既存ユーザーが登録済みです。既存ユーザーでログイン後、こちらのSNSとの連携が可能です。`,
          );
          return;
        }
        setError(`ログイン/新規登録に失敗しました。\n${err.message}`);
      }
    },
    [router],
  );

  const googleLogin = useCallback(
    () => handleSocialSignIn(new GoogleAuthProvider()),
    [handleSocialSignIn],
  );
  const twitterLogin = useCallback(
    () => handleSocialSignIn(new TwitterAuthProvider()),
    [handleSocialSignIn],
  );
  const githubLogin = useCallback(
    () => handleSocialSignIn(new GithubAuthProvider()),
    [handleSocialSignIn],
  );

  return (
    <div className="min-h-screen">
      <Header />

      <div className="luxury-page flex items-center justify-center min-h-screen">
        <div className="luxury-card max-w-md w-full mx-auto animate-fade-in-up">
          <h1
            className="text-4xl md:text-5xl font-medium text-center mb-8 text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            会員登録
          </h1>

          <div className="w-16 h-1 bg-gradient-to-r from-[var(--gold-400)] to-[var(--terracotta-400)] mx-auto mb-10" />

          {error && (
            <div className="rounded-xl p-4 mb-6 bg-red-50 border border-red-200 text-sm text-red-700 whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-2xl transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              onClick={googleLogin}
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
              <span>Googleで新規登録</span>
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-2xl transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              onClick={twitterLogin}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X(Twitter)で新規登録</span>
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-2xl transition-all duration-300 font-medium shadow-sm hover:shadow-md"
              onClick={githubLogin}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Githubで新規登録</span>
            </button>
          </div>

          <p className="text-center text-sm text-muted mt-8">
            新規登録できない場合はSNSアカウントを作成してください
          </p>

          <div className="divider" />

          <p className="text-center text-sm">
            アカウントをお持ちの方は{" "}
            <Link
              href="/login"
              className="text-[var(--primary)] hover:text-[var(--primary-hover)] underline underline-offset-4 font-medium transition-colors"
            >
              ログインはこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
