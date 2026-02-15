"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";

export default function ProfileStep3() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) router.replace("/login");
      try {
        const res = await apiClient.get("/api/members/me");
        if (res?.data?.username) router.replace("/menus");
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream-50)] via-white to-[var(--sage-50)]">
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 sm:px-6 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]">
                プロフィール登録
              </span>
              <span className="text-xs sm:text-sm text-muted">
                ステップ 5/7
              </span>
            </div>
            <div className="h-2 bg-[var(--cream-100)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--sage-400)] to-[var(--sage-500)] transition-all duration-500 ease-out"
                style={{ width: "71%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-24 sm:mt-28">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--cream-200)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[var(--terracotta-400)] via-[var(--gold-400)] to-[var(--sage-400)]"></div>

            <div className="p-6 sm:p-8 md:p-12">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[var(--terracotta-100)] to-[var(--sage-100)] mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl">🎯</span>
                </div>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8 sm:mb-10">
                <div className="p-5 sm:p-6 rounded-xl bg-[var(--sage-50)] border border-[var(--sage-200)]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <span className="text-2xl sm:text-3xl">❤️</span>
                  </div>
                  <h4
                    className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    好きなもの
                  </h4>
                  <p className="text-sm sm:text-base text-muted leading-relaxed">
                    好きな食べ物や料理を選んでください
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-xl bg-[var(--terracotta-50)] border border-[var(--terracotta-200)]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <span className="text-2xl sm:text-3xl">🚫</span>
                  </div>
                  <h4
                    className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    苦手なもの
                  </h4>
                  <p className="text-sm sm:text-base text-muted leading-relaxed">
                    避けたい食材や料理を選んでください
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/profile/step2")}
                  className="w-full sm:flex-1 px-6 py-3 sm:py-4 rounded-xl font-medium text-[var(--foreground)]
                           bg-[var(--cream-100)] hover:bg-[var(--cream-200)] border-2 border-[var(--cream-200)]
                           transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 17l-5-5m0 0l5-5m-5 5h12"
                    />
                  </svg>
                  <span>戻る</span>
                </button>

                <button
                  onClick={() => router.push("/profile/step3-1")}
                  className="w-full sm:flex-1 px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg text-white
                           transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                           flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl min-h-[44px]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                  }}
                >
                  <span>始める</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
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
