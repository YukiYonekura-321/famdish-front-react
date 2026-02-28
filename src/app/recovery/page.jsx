"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  sendSignInLinkToEmail,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { Header } from "@/components/header";

export default function RecoveryPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/menus");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSending(true);
      setMessage("");
      setIsError(false);

      const actionCodeSettings = {
        url: `${window.location.origin}/menus`,
        handleCodeInApp: true,
      };
      auth.languageCode = "ja";

      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        }
        setEmail("");
        setMessage(
          `${email}が登録済みである場合、ログイン用のURLが送られています。`,
        );
      } catch (err) {
        setIsError(true);
        setMessage(`ログイン用URLの送信に失敗しました。\n${err.message}`);
      } finally {
        setSending(false);
      }
    },
    [email],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream-50)] via-white to-[var(--sage-50)]">
      <Header />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--cream-200)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[var(--terracotta-400)] via-[var(--gold-400)] to-[var(--sage-400)]" />

            <div className="p-6 sm:p-8 md:p-10 space-y-6">
              {/* ヘッダー */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[var(--gold-100)] to-[var(--cream-100)] mb-4">
                  <span className="text-3xl sm:text-4xl">🔑</span>
                </div>
                <h1
                  className="text-2xl sm:text-3xl font-light text-[var(--foreground)] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  アカウントの回復
                </h1>
                <p className="text-sm sm:text-base text-muted">
                  登録しているメールアドレスにログイン用のURLを送信します。
                </p>
              </div>

              {/* フォーム */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    登録しているメールアドレス
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={sending}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--cream-200)]
                               focus:outline-none focus:border-[var(--sage-400)] focus:ring-2 focus:ring-[var(--sage-100)]
                               text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {message && (
                  <div
                    className={`rounded-xl p-4 text-sm leading-relaxed ${
                      isError
                        ? "bg-red-50 border border-red-200 text-red-700"
                        : "bg-[var(--sage-50)] border border-[var(--sage-200)] text-[var(--sage-700)]"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending || !email}
                  className="w-full px-6 py-3 sm:py-4 rounded-xl font-semibold text-white
                             transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                             shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed
                             disabled:hover:scale-100 min-h-[44px]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                  }}
                >
                  {sending ? "送信中..." : "ログイン用URLを送信"}
                </button>
              </form>

              {/* フッターリンク */}
              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-sm text-muted hover:text-[var(--primary)] transition-colors underline underline-offset-2"
                >
                  ログインページに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
