"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";

const OPTIONS = [
  "寿司",
  "カレー",
  "ピザ",
  "パスタ",
  "パン",
  "肉料理",
  "魚料理",
  "野菜",
  "果物",
  "デザート",
  "チーズ",
  "卵料理",
  "豆腐",
  "サラダ",
  "スープ",
  "シーフード",
  "和食",
  "洋食",
  "中華",
  "辛いもの",
];

export default function ProfileStep3_1() {
  const router = useRouter();
  const [selected, setSelected] = useState([]);

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

  const toggle = (opt) => {
    setSelected((prev) => {
      const exists = prev.includes(opt);
      return exists ? prev.filter((p) => p !== opt) : [...prev, opt];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sessionStorage.setItem("profile_likes", JSON.stringify(selected));
    router.push("/profile/step3-2");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream-50)] via-white to-[var(--sage-50)]">
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 py-28 sm:py-32">
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 sm:px-6 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]">
                プロフィール登録
              </span>
              <span className="text-xs sm:text-sm text-muted">ステップ 6/7</span>
            </div>
            <div className="h-2 bg-[var(--cream-100)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--sage-400)] to-[var(--sage-500)] transition-all duration-500 ease-out"
                style={{ width: "85%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--cream-200)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[var(--terracotta-400)] via-[var(--gold-400)] to-[var(--sage-400)]"></div>

            <div className="p-6 sm:p-8 md:p-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[var(--sage-100)] to-[var(--gold-100)] mb-4">
                  <span className="text-3xl sm:text-4xl">❤️</span>
                </div>

                <h1
                  className="text-2xl sm:text-3xl md:text-4xl font-light mb-3 sm:mb-4 text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  好きなものを選んでください
                </h1>

                <p className="text-sm sm:text-base text-muted">
                  複数選択できます
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {OPTIONS.map((opt) => {
                    const isSelected = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className={`relative p-3 sm:p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                                 text-center font-medium text-sm sm:text-base min-h-[44px] flex items-center justify-center ${
                                   isSelected
                                     ? "bg-gradient-to-br from-[var(--sage-100)] to-[var(--sage-200)] border-2 border-[var(--sage-400)] shadow-md"
                                     : "bg-white border-2 border-[var(--cream-200)] hover:border-[var(--sage-300)]"
                                 }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--sage-500)] flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                        <span
                          className={
                            isSelected
                              ? "text-[var(--sage-700)]"
                              : "text-[var(--foreground)]"
                          }
                        >
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-[var(--sage-50)] border border-[var(--sage-200)] rounded-xl p-4 sm:p-5 text-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">🎉</span>
                    <div>
                      <span
                        className="text-xl sm:text-2xl font-semibold text-[var(--primary)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {selected.length}
                      </span>
                      <span className="text-sm sm:text-base text-muted ml-2">
                        個選択中
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/profile/step3")}
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
              </form>
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-muted">
              あと1ステップで完了です！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
