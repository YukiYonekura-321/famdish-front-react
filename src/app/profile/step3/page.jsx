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
    <div className="min-h-screen overflow-hidden aurora">
      <div className="fixed inset-0 gradient-mesh particle-bg"></div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-28 left-[12%] w-96 h-96 rounded-full blur-3xl opacity-18 floating"
          style={{
            background:
              "radial-gradient(circle, var(--gold-400), transparent 70%)",
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute top-36 right-[15%] w-80 h-80 rounded-full blur-3xl opacity-16 floating"
          style={{
            background:
              "radial-gradient(circle, var(--terracotta-400), transparent 70%)",
            animationDelay: "3s",
          }}
        ></div>
        <div
          className="absolute bottom-20 left-[30%] w-72 h-72 rounded-full blur-3xl opacity-18 floating"
          style={{
            background:
              "radial-gradient(circle, var(--sage-400), transparent 70%)",
            animationDelay: "5s",
          }}
        ></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-10 animate-fade-in">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "71%" }}></div>
          </div>
          <div className="text-center mt-3 text-sm font-medium text-muted">
            Step 5 of 7
          </div>
        </div>

        <div className="ultra-card max-w-3xl w-full animate-fade-in-up tilt-3d">
          <div
            className="h-2 rounded-t-3xl"
            style={{
              background:
                "linear-gradient(90deg, var(--terracotta-400), var(--gold-400), var(--sage-400))",
            }}
          ></div>

          <div className="p-12 sm:p-16">
            <div className="text-center mb-8 animate-fade-in-up stagger-1">
              <div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 floating"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(217, 112, 72, 0.15), rgba(90, 122, 90, 0.15))",
                  boxShadow: "0 8px 32px rgba(212, 175, 55, 0.2)",
                }}
              >
                <span className="text-5xl">🎯</span>
              </div>
            </div>

            <h1
              className="text-5xl sm:text-6xl font-light text-center mb-6 gradient-text animate-fade-in-up stagger-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Personalize Your Experience
            </h1>

            <p
              className="text-xl sm:text-2xl text-center text-muted mb-12 glow-text animate-fade-in-up stagger-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Tell us about your food preferences
            </p>

            <div className="glass-ultra rounded-2xl p-8 mb-12 animate-fade-in-up stagger-4">
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center floating"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--terracotta-400), var(--gold-400))",
                    boxShadow: "0 4px 16px rgba(217, 112, 72, 0.3)",
                  }}
                >
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold text-[var(--foreground)] mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Just 40 seconds to go!
                  </h3>
                  <p className="text-muted leading-relaxed">
                    The next two steps help us understand what you love and what
                    you'd rather avoid. This ensures every suggestion is
                    perfectly tailored to your family's tastes.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-12 animate-fade-in-up stagger-5">
              <div className="neuro-card p-8 text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center floating"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(90, 122, 90, 0.2), rgba(90, 122, 90, 0.3))",
                    animationDelay: "0s",
                  }}
                >
                  <span className="text-3xl">❤️</span>
                </div>
                <h4
                  className="font-semibold text-[var(--foreground)] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Your Favorites
                </h4>
                <p className="text-sm text-muted">
                  Foods and flavors you absolutely love
                </p>
              </div>

              <div className="neuro-card p-8 text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center floating"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(217, 112, 72, 0.2), rgba(217, 112, 72, 0.3))",
                    animationDelay: "1.5s",
                  }}
                >
                  <span className="text-3xl">🚫</span>
                </div>
                <h4
                  className="font-semibold text-[var(--foreground)] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  What to Avoid
                </h4>
                <p className="text-sm text-muted">
                  Foods and ingredients to skip
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-6">
              <button
                type="button"
                onClick={() => router.push("/profile/step2")}
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
                onClick={() => router.push("/profile/step3-1")}
                className="group relative px-12 py-5 rounded-full font-semibold text-lg text-white
                         transition-all duration-500 hover:scale-105 hover:shadow-2xl flex-1
                         flex items-center justify-center gap-3 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                  boxShadow:
                    "0 8px 32px rgba(90, 122, 90, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                }}
              >
                <span
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--sage-400), var(--sage-600))",
                  }}
                ></span>

                <span className="relative z-10 flex items-center gap-3">
                  <span>Let's Do This</span>
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
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center animate-fade-in">
          <p className="text-sm text-muted">
            Almost there! Your personalized menu experience awaits
          </p>
        </div>
      </div>
    </div>
  );
}
