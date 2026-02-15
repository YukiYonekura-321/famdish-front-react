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
    <div className="min-h-screen overflow-hidden aurora">
      <div className="fixed inset-0 gradient-mesh particle-bg"></div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-16 left-[8%] w-64 h-64 rounded-full blur-3xl opacity-15 floating"
          style={{
            background: "radial-gradient(circle, var(--sage-400), transparent 70%)",
            animationDelay: "0.8s"
          }}
        ></div>
        <div
          className="absolute bottom-24 right-[12%] w-80 h-80 rounded-full blur-3xl opacity-18 floating"
          style={{
            background: "radial-gradient(circle, var(--gold-400), transparent 70%)",
            animationDelay: "2.8s"
          }}
        ></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6 py-24">
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-10 animate-fade-in">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '85%' }}></div>
          </div>
          <div className="text-center mt-3 text-sm font-medium text-muted">
            Step 6 of 7
          </div>
        </div>

        <div className="ultra-card max-w-4xl w-full animate-fade-in-up tilt-3d">
          <div
            className="h-2 rounded-t-3xl"
            style={{
              background: "linear-gradient(90deg, var(--terracotta-400), var(--gold-400), var(--sage-400))"
            }}
          ></div>

          <div className="p-10 sm:p-14">
            <div className="text-center mb-10 animate-fade-in-up stagger-1">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 floating"
                   style={{
                     background: "linear-gradient(135deg, rgba(90, 122, 90, 0.2), rgba(212, 175, 55, 0.15))",
                     boxShadow: "0 8px 32px rgba(90, 122, 90, 0.25)"
                   }}>
                <span className="text-4xl">❤️</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-light mb-4 gradient-text"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What Do You Love?
              </h1>

              <p className="text-muted text-lg">
                Select your favorite foods and cuisines (choose as many as you like)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up stagger-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {OPTIONS.map((opt, idx) => {
                  const isSelected = selected.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggle(opt)}
                      className={`group relative p-4 rounded-2xl transition-all duration-300 hover:scale-105
                               text-center font-medium animate-fade-in-up`}
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg, var(--sage-100), var(--sage-200))"
                          : "linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))",
                        backdropFilter: "blur(20px)",
                        border: isSelected
                          ? "2px solid var(--sage-400)"
                          : "2px solid rgba(212, 175, 55, 0.15)",
                        boxShadow: isSelected
                          ? "0 8px 24px rgba(90, 122, 90, 0.25), inset 0 2px 8px rgba(255, 255, 255, 0.5)"
                          : "0 4px 12px rgba(212, 175, 55, 0.08), inset 0 2px 8px rgba(255, 255, 255, 0.5)",
                        animationDelay: `${idx * 0.03}s`
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--sage-500)]
                                     flex items-center justify-center animate-scale-in">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <span className={`text-base transition-colors ${
                        isSelected ? "text-[var(--sage-700)]" : "text-[var(--foreground)]"
                      }`}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="glass-ultra rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <span className="font-semibold text-[var(--primary)] text-xl"
                          style={{ fontFamily: "var(--font-display)" }}>
                      {selected.length}
                    </span>
                    <span className="text-muted ml-2">items selected</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/profile/step3")}
                  className="group relative px-8 py-4 rounded-full font-medium text-[var(--foreground)]
                           transition-all duration-300 hover:scale-105 flex-1
                           bg-gradient-to-br from-[var(--cream-100)] to-[var(--cream-200)]
                           border border-[var(--gold-400)]/20 hover:border-[var(--gold-400)]/40"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 17l-5-5m0 0l5-5m-5 5h12"
                      />
                    </svg>
                    <span>Back</span>
                  </span>
                </button>

                <button
                  type="submit"
                  className="group relative px-8 py-4 rounded-full font-semibold text-white
                           transition-all duration-500 hover:scale-105 hover:shadow-2xl flex-1
                           flex items-center justify-center gap-2 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                    boxShadow: "0 8px 32px rgba(90, 122, 90, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{
                      background: "linear-gradient(135deg, var(--sage-400), var(--sage-600))"
                    }}
                  ></span>

                  <span className="relative z-10 flex items-center gap-2">
                    <span>Continue</span>
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center animate-fade-in">
          <p className="text-xs text-muted">
            One more step to complete your profile!
          </p>
        </div>
      </div>
    </div>
  );
}
