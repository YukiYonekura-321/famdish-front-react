"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { apiClient } from "@/shared/lib/api";
import { ProgressBar } from "@/features/profile/components/ProgressBar";
import { TOTAL_STEPS, STEP1_FEATURES } from "@/features/profile/constants";
import { FeatureCard } from "@/features/profile/components/FeatureCard";
import { ArrowIcon } from "@/features/profile/components/ArrowIcon";

// ── メインコンポーネント ──

export default function ProfileStep1() {
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

  const handleNext = useCallback(() => {
    router.push("/profile/step1-1");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream-50)] via-white to-[var(--sage-50)]">
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <ProgressBar current={1} total={TOTAL_STEPS} />

        {/* Main content card */}
        <div className="w-full max-w-2xl mt-24 sm:mt-28">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--cream-200)] overflow-hidden">
            {/* Header accent */}
            <div className="h-1.5 bg-gradient-to-r from-[var(--terracotta-400)] via-[var(--gold-400)] to-[var(--sage-400)]" />

            <div className="p-6 sm:p-8 md:p-12">
              {/* Title */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-light text-center mb-4 sm:mb-6 text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                FamDishへようこそ
              </h1>

              {/* Subtitle */}
              <p
                className="text-base sm:text-lg text-center text-muted mb-8 sm:mb-12 max-w-xl mx-auto leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                ご家族の食卓を豊かにする、
                <br className="sm:hidden" />
                献立提案サービスです
              </p>

              {/* Info card */}
              <div className="bg-gradient-to-br from-[var(--cream-50)] to-[var(--sage-50)] rounded-xl sm:rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10 border border-[var(--gold-200)]">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--gold-400)] to-[var(--terracotta-400)] flex items-center justify-center shadow-sm">
                    <span className="text-xl sm:text-2xl">⏱️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      30秒で、ご家族にぴったりのごはんを見つけましょう。
                    </h3>
                    <p className="text-sm sm:text-base text-muted leading-relaxed">
                      いくつかの簡単な質問に答えるだけで、好みに合ったメニューをご提案します。
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <div className="flex justify-center">
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto group relative px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg text-white
                           transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                           flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl min-h-[44px]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                  }}
                >
                  <span>はじめる</span>
                  <ArrowIcon />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-10">
                {STEP1_FEATURES.map((f) => (
                  <FeatureCard key={f.title} {...f} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
