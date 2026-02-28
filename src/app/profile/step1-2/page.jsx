"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  verifyBeforeUpdateEmail,
  reauthenticateWithPopup,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { getProvider } from "@/app/lib/provider-utils";
import { apiClient } from "@/app/lib/api";
import { ProgressBar } from "@/components/ProgressBar";
import { BackArrow, ForwardArrow } from "@/components/ProfileNavArrows";

// ── 定数 ──

const TOTAL_STEPS = 7;
const CONFIRM_MSG = (email) =>
  `${email}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`;

// ── メインコンポーネント ──

export default function ProfileStep1Part2() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [optOut, setOptOut] = useState(false);

  // ── 認証 & 登録済みチェック ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.email) setEmail(user.email);
      try {
        const res = await apiClient.get("/api/members/me");
        if (res?.data?.username) router.replace("/menus");
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── メール更新 ──
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (optOut) {
        router.push("/profile/step2");
        return;
      }

      auth.languageCode = "ja";
      const user = auth.currentUser;

      if (user.email === email) {
        router.push("/profile/step2");
        return;
      }

      const actionCodeSettings = { url: `${window.location.origin}/login` };
      const provider = getProvider(user);

      try {
        await reauthenticateWithPopup(user, provider);
        await verifyBeforeUpdateEmail(user, email, actionCodeSettings);
        alert(CONFIRM_MSG(email));
        setEmail("");
        router.push("/profile/step2");
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          alert(CONFIRM_MSG(email));
          setEmail("");
          return;
        }
        alert(`メールの送信に失敗しました\n${error.message}`);
      }
    },
    [email, optOut, router],
  );

  const handleBack = useCallback(() => {
    router.push("/profile/step1-1");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream-50)] via-white to-[var(--sage-50)]">
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <ProgressBar current={3} total={TOTAL_STEPS} />

        <div className="w-full max-w-2xl mt-24 sm:mt-28">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--cream-200)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[var(--terracotta-400)] via-[var(--gold-400)] to-[var(--sage-400)]" />

            <div className="p-6 sm:p-8 md:p-10">
              {/* Icon */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[var(--terracotta-100)] to-[var(--gold-100)] mb-4">
                  <span className="text-3xl sm:text-4xl">✉️</span>
                </div>
              </div>

              {/* Title */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-3 sm:mb-4 text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                通知メールの設定
              </h1>

              <p className="text-sm sm:text-base text-center text-muted mb-8 sm:mb-10">
                FamDishからのお知らせを受け取るメールアドレスを設定します
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <div>
                  <label
                    className="block text-sm sm:text-base font-medium text-[var(--foreground)] mb-2 sm:mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 border-[var(--cream-200)]
                             focus:border-[var(--sage-400)] focus:ring-4 focus:ring-[var(--sage-100)]
                             transition-all duration-200 text-base sm:text-lg bg-white disabled:bg-gray-100 min-h-[44px]"
                    placeholder="example@domain.com"
                    disabled={optOut}
                  />
                </div>

                {/* Opt-out */}
                <div className="bg-[var(--cream-50)] border border-[var(--gold-200)] rounded-xl p-4 sm:p-5">
                  <label className="flex items-start gap-3 sm:gap-4 cursor-pointer">
                    <input
                      id="optout"
                      type="checkbox"
                      checked={optOut}
                      onChange={(e) => setOptOut(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-2 border-[var(--gold-400)]
                               text-[var(--primary)] focus:ring-2 focus:ring-[var(--gold-400)]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium text-[var(--foreground)] mb-1">
                        通知を受け取らない
                      </span>
                      <span className="block text-sm text-muted">
                        後から設定で変更できます
                      </span>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full sm:flex-1 px-6 py-3 sm:py-4 rounded-xl font-medium text-[var(--foreground)]
                             bg-[var(--cream-100)] hover:bg-[var(--cream-200)] border-2 border-[var(--cream-200)]
                             transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <BackArrow />
                    <span>戻る</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-6 py-3 sm:py-4 rounded-xl font-semibold text-white
                             transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                             flex items-center justify-center gap-2 shadow-lg hover:shadow-xl min-h-[44px]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                    }}
                  >
                    <span>次へ</span>
                    <ForwardArrow />
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-muted">
              🔒 メールアドレスは安全に保管されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
