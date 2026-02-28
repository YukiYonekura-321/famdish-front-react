"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { apiClient } from "@/shared/lib/api";
import { Header } from "@/shared/components/header";
import { buildLoginUrl } from "@/features/auth/lib/redirect-utils";

export default function RegisterEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [redirectParam, setRedirectParam] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  // email-already-in-use の確認ダイアログ代替（{ email } をセット）
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    setRedirectParam(redirect);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const dest = redirect
          ? `/login?redirect=${encodeURIComponent(redirect)}&emailVerified=true`
          : "/login?emailVerified=true";
        router.replace(dest);
        return;
      }

      try {
        const res = await apiClient.get("/api/members/me");
        if (res?.data?.username) {
          router.replace("/menus");
          return;
        }
      } catch (err) {
        console.error("member/me check failed", err);
      }

      setEmail(user.email || "");
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.replace(buildLoginUrl(redirectParam));
    } catch (err) {
      console.error("Logout failed", err);
    }
  }, [router, redirectParam]);

  // email-already-in-use の「はい」を選択した場合
  const handleConfirmRelogin = useCallback(async () => {
    const user = auth.currentUser;
    if (user) await user.delete();
    setConfirmDialog(null);
    router.replace(buildLoginUrl(redirectParam));
  }, [router, redirectParam]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSending(true);
      setMessage("");
      setIsError(false);

      const emailToBeRegistered = email;
      const user = auth.currentUser;

      if (!user) {
        setIsError(true);
        setMessage(
          "認証情報を取得できませんでした。再度ログインしてください。",
        );
        router.replace(buildLoginUrl(redirectParam));
        setSending(false);
        return;
      }

      auth.languageCode = "ja";

      const redirectPath = redirectParam
        ? `?redirect=${encodeURIComponent(redirectParam)}`
        : "";
      const actionCodeSettings = {
        url: `${window.location.origin}/register-email${redirectPath}`,
      };

      // プロバイダのメールと異なるアドレスを登録する場合
      if (user.email !== emailToBeRegistered) {
        try {
          await verifyBeforeUpdateEmail(
            user,
            emailToBeRegistered,
            actionCodeSettings,
          );
          setEmail("");
          setMessage(`${emailToBeRegistered}に確認メールを送りました`);
        } catch (error) {
          if (error.code === "auth/email-already-in-use") {
            setConfirmDialog({ email: emailToBeRegistered });
          } else if (error.code === "auth/requires-recent-login") {
            setIsError(true);
            setMessage("安全のため、再ログインが必要です。");
            await signOut(auth);
            router.replace(buildLoginUrl(redirectParam));
          } else {
            setIsError(true);
            setMessage(`メールの送信に失敗しました。\n${error.message}`);
          }
        } finally {
          setSending(false);
        }
        return;
      }

      // プロバイダのメールをそのまま登録する場合
      try {
        const emailVerificationUrl = redirectParam
          ? `${window.location.origin}/login?redirect=${encodeURIComponent(redirectParam)}&emailVerified=true`
          : `${window.location.origin}/login?emailVerified=true`;

        await sendEmailVerification(user, {
          url: emailVerificationUrl,
          handleCodeInApp: false,
        });
        setEmail("");
        setMessage(`${emailToBeRegistered}に確認メールを送りました`);
      } catch (error) {
        setIsError(true);
        setMessage(`メールの送信に失敗しました。\n${error.message}`);
      } finally {
        setSending(false);
      }
    },
    [email, redirectParam, router],
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
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[var(--sage-100)] to-[var(--gold-100)] mb-4">
                  <span className="text-3xl sm:text-4xl">✉️</span>
                </div>
                <h1
                  className="text-2xl sm:text-3xl font-light text-[var(--foreground)] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  メールアドレスの登録
                </h1>
                <p className="text-sm sm:text-base text-muted">
                  メールアドレスの登録と確認が必要です。確認用のURLを送信します。
                </p>
              </div>

              {/* email-already-in-use 確認ダイアログ */}
              {confirmDialog && (
                <div className="rounded-xl p-4 sm:p-5 bg-amber-50 border border-amber-200 space-y-3">
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>{confirmDialog.email}</strong> は他の SNS
                    と連携した既存ユーザーで登録済みです。マイページにてこちらの
                    SNS
                    との連携が可能です。既存のユーザーでログインしなおしますか？
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmRelogin}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white
                                 bg-[var(--terracotta-500)] hover:bg-[var(--terracotta-600)]
                                 transition-colors min-h-[40px]"
                    >
                      はい・ログインし直す
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDialog(null);
                        setEmail("");
                      }}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-[var(--foreground)]
                                 bg-[var(--cream-100)] hover:bg-[var(--cream-200)]
                                 border border-[var(--cream-200)] transition-colors min-h-[40px]"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {/* フィードバックメッセージ */}
              {message && (
                <div
                  className={`rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line ${
                    isError
                      ? "bg-red-50 border border-red-200 text-red-700"
                      : "bg-[var(--sage-50)] border border-[var(--sage-200)] text-[var(--sage-700)]"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* フォーム */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    メールアドレス
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
                  {sending ? "送信中..." : "確認メールを送信"}
                </button>
              </form>

              {/* ログアウト */}
              <div className="text-center pt-2">
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted hover:text-[var(--primary)] transition-colors underline underline-offset-2"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
