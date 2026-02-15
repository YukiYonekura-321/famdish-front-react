"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";

export default function ProfileStep1_1() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      sessionStorage.setItem("profile_display_name", displayName);
      setMessage(`保存しました: ${displayName}`);
      router.push("/profile/step1-2");
    } catch (error) {
      setMessage("通信エラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden aurora">
      <div className="fixed inset-0 gradient-mesh particle-bg"></div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-32 right-[20%] w-72 h-72 rounded-full blur-3xl opacity-20 floating"
          style={{
            background: "radial-gradient(circle, var(--terracotta-400), transparent 70%)",
            animationDelay: "1s"
          }}
        ></div>
        <div
          className="absolute bottom-40 left-[15%] w-80 h-80 rounded-full blur-3xl opacity-15 floating"
          style={{
            background: "radial-gradient(circle, var(--gold-400), transparent 70%)",
            animationDelay: "3s"
          }}
        ></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-10 animate-fade-in">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '28%' }}></div>
          </div>
          <div className="text-center mt-3 text-sm font-medium text-muted">
            Step 2 of 7
          </div>
        </div>

        <div className="ultra-card max-w-2xl w-full animate-fade-in-up tilt-3d">
          <div
            className="h-2 rounded-t-3xl"
            style={{
              background: "linear-gradient(90deg, var(--terracotta-400), var(--gold-400), var(--sage-400))"
            }}
          ></div>

          <div className="p-10 sm:p-14">
            <div className="text-center mb-8 animate-fade-in-up stagger-1">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 floating"
                   style={{
                     background: "linear-gradient(135deg, rgba(90, 122, 90, 0.15), rgba(212, 175, 55, 0.15))",
                     boxShadow: "0 8px 32px rgba(212, 175, 55, 0.2)"
                   }}>
                <span className="text-4xl">👤</span>
              </div>
            </div>

            <h1
              className="text-4xl sm:text-5xl font-light text-center mb-4 gradient-text animate-fade-in-up stagger-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What should we call you?
            </h1>

            <p className="text-center text-muted mb-10 animate-fade-in-up stagger-3">
              Choose a display name that your family will see. You can change it anytime.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up stagger-4">
              <div>
                <label
                  className="luxury-label text-base block mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="luxury-input w-full text-lg"
                  placeholder="例: さくら"
                  required
                  style={{
                    background: "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))",
                    backdropFilter: "blur(20px)",
                    border: "2px solid rgba(212, 175, 55, 0.2)",
                    boxShadow: "0 8px 24px rgba(212, 175, 55, 0.1), inset 0 2px 8px rgba(255, 255, 255, 0.5)"
                  }}
                />
              </div>

              {message && (
                <div className="glass-ultra rounded-xl p-4 text-center animate-fade-in">
                  <p className="text-sm text-[var(--primary)]">{message}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/profile/step1")}
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
            💡 Tip: Pick a name that feels personal and welcoming
          </p>
        </div>
      </div>
    </div>
  );
}
