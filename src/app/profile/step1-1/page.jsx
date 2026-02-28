"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { apiClient } from "@/shared/lib/api";
import { ProgressBar } from "@/features/profile/components/ProgressBar";
import { BackArrow, ForwardArrow } from "@/features/profile/components/ProfileNavArrows";

// ── 定数 ──

const TOTAL_STEPS = 7;

// ── メインコンポーネント ──

export default function ProfileStep1Part1() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");

  // ── 認証 & 登録済みチェック ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      try {
        const res = await apiClient.get("/api/members/me");
        if (res?.data?.username) router.replace("/menus");
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── 送信 ──
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      sessionStorage.setItem("profile_display_name", displayName.trim());
      router.push("/profile/step1-2");
    },
    [displayName, router],
  );

  const handleBack = useCallback(() => {
    router.push("/profile/step1");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream-50)] via-white to-[var(--sage-50)]">
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <ProgressBar current={2} total={TOTAL_STEPS} />

        {/* Main content card */}
        <div className="w-full max-w-2xl mt-24 sm:mt-28">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--cream-200)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[var(--terracotta-400)] via-[var(--gold-400)] to-[var(--sage-400)]" />

            <div className="p-6 sm:p-8 md:p-10">
              {/* Icon */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[var(--sage-100)] to-[var(--gold-100)] mb-4">
                  <span className="text-3xl sm:text-4xl">👤</span>
                </div>
              </div>

              {/* Title */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-3 sm:mb-4 text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                表示名を設定してください
              </h1>

              <p className="text-sm sm:text-base text-center text-muted mb-8 sm:mb-10">
                ご家族に表示される名前です。後から変更できます。
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <div>
                  <label
                    className="block text-sm sm:text-base font-medium text-[var(--foreground)] mb-2 sm:mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    表示名
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 border-[var(--cream-200)]
                             focus:border-[var(--sage-400)] focus:ring-4 focus:ring-[var(--sage-100)]
                             transition-all duration-200 text-base sm:text-lg bg-white min-h-[44px]"
                    placeholder="例: さくら"
                    required
                    autoFocus
                  />
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

          {/* Tip */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-muted">
              💡 親しみやすい名前をおすすめします
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
