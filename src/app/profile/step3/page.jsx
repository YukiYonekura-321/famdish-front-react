"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";
import { ProgressBar } from "@/components/ProgressBar";
import { BackArrow, ForwardArrow } from "@/components/ProfileNavArrows";

// ── 定数 ──

const TOTAL_STEPS = 7;

// ── メインコンポーネント ──

export default function ProfileStep3() {
  const router = useRouter();

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

  const handleBack = useCallback(() => router.push("/profile/step2"), [router]);
  const handleNext = useCallback(
    () => router.push("/profile/step3-1"),
    [router],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream-50)] via-white to-[var(--sage-50)]">
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <ProgressBar current={5} total={TOTAL_STEPS} />

        <div className="w-full max-w-2xl mt-24 sm:mt-28">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--cream-200)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[var(--terracotta-400)] via-[var(--gold-400)] to-[var(--sage-400)]" />

            <div className="p-6 sm:p-8 md:p-12">
              {/* Icon */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[var(--terracotta-100)] to-[var(--sage-100)] mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl">🎯</span>
                </div>
              </div>

              {/* Title */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-light text-center mb-4 sm:mb-6 text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                好みを教えてください
              </h1>

              <p
                className="text-base sm:text-lg text-center text-muted mb-8 sm:mb-12 max-w-xl mx-auto leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                あなたの好みに合わせて、
                <br className="sm:hidden" />
                最適な献立をご提案します
              </p>

              {/* Info card */}
              <div className="bg-gradient-to-br from-[var(--cream-50)] to-[var(--terracotta-50)] rounded-xl sm:rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10 border border-[var(--terracotta-200)]">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--terracotta-400)] to-[var(--gold-400)] flex items-center justify-center shadow-sm">
                    <span className="text-xl sm:text-2xl">⏱️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      このステップは40秒で完了します。
                    </h3>
                    <p className="text-sm sm:text-base text-muted leading-relaxed">
                      次の2ステップで、好きなもの・苦手なものを教えてください。
                      ご家族の好みに合った提案をお届けします。
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
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
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:flex-1 px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg text-white
                           transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                           flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl min-h-[44px]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                  }}
                >
                  <span>始める</span>
                  <ForwardArrow />
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-muted">
              もう少しで完了です！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
