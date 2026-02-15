"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";

export default function ProfileStep1() {
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

  const handleNext = () => {
    router.push("/profile/step1-1");
  };

  return (
    <div className="min-h-screen overflow-hidden aurora">
      {/* Atmospheric background layers */}
      <div className="fixed inset-0 gradient-mesh particle-bg"></div>

      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-[10%] w-64 h-64 rounded-full blur-3xl opacity-20 floating"
          style={{
            background: "radial-gradient(circle, var(--gold-400), transparent 70%)",
            animationDelay: "0s"
          }}
        ></div>
        <div
          className="absolute top-40 right-[15%] w-96 h-96 rounded-full blur-3xl opacity-15 floating"
          style={{
            background: "radial-gradient(circle, var(--terracotta-400), transparent 70%)",
            animationDelay: "2s"
          }}
        ></div>
        <div
          className="absolute bottom-32 left-[20%] w-80 h-80 rounded-full blur-3xl opacity-20 floating"
          style={{
            background: "radial-gradient(circle, var(--sage-400), transparent 70%)",
            animationDelay: "4s"
          }}
        ></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        {/* Progress indicator */}
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-10 animate-fade-in">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '14%' }}></div>
          </div>
          <div className="text-center mt-3 text-sm font-medium text-muted">
            Step 1 of 7
          </div>
        </div>

        {/* Main welcome card */}
        <div className="ultra-card max-w-3xl w-full animate-fade-in-up tilt-3d">
          {/* Gold accent border */}
          <div
            className="h-2 rounded-t-3xl"
            style={{
              background: "linear-gradient(90deg, var(--terracotta-400), var(--gold-400), var(--sage-400))"
            }}
          ></div>

          <div className="p-12 sm:p-16">
            {/* Welcome icon with glow */}
            <div className="text-center mb-8 animate-fade-in-up stagger-1">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 floating"
                   style={{
                     background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(217, 112, 72, 0.1))",
                     boxShadow: "0 8px 32px rgba(212, 175, 55, 0.2), inset 0 0 20px rgba(212, 175, 55, 0.1)"
                   }}>
                <span className="text-5xl">✨</span>
              </div>
            </div>

            {/* Gradient holographic title */}
            <h1
              className="text-5xl sm:text-6xl font-light text-center mb-6 gradient-text animate-fade-in-up stagger-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome to FamDish
            </h1>

            {/* Subtitle with glow */}
            <p className="text-xl sm:text-2xl text-center text-muted mb-12 glow-text animate-fade-in-up stagger-3"
               style={{ fontFamily: "var(--font-body)" }}>
              Your family's culinary journey begins here
            </p>

            {/* Promise section */}
            <div className="glass-ultra rounded-2xl p-8 mb-12 animate-fade-in-up stagger-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center floating"
                     style={{
                       background: "linear-gradient(135deg, var(--gold-400), var(--terracotta-400))",
                       boxShadow: "0 4px 16px rgba(212, 175, 55, 0.3)"
                     }}>
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3"
                      style={{ fontFamily: "var(--font-display)" }}>
                    Just 30 seconds to perfection
                  </h3>
                  <p className="text-muted leading-relaxed">
                    We'll ask you a few simple questions to personalize your family's menu experience.
                    Your preferences will help us suggest the perfect dishes that everyone will love.
                  </p>
                </div>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12 animate-fade-in-up stagger-5">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center floating"
                     style={{
                       background: "linear-gradient(135deg, rgba(90, 122, 90, 0.1), rgba(90, 122, 90, 0.2))",
                       animationDelay: "0s"
                     }}>
                  <span className="text-3xl">🏠</span>
                </div>
                <h4 className="font-medium text-[var(--foreground)] mb-2">Family-Focused</h4>
                <p className="text-sm text-muted">Tailored for your household</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center floating"
                     style={{
                       background: "linear-gradient(135deg, rgba(217, 112, 72, 0.1), rgba(217, 112, 72, 0.2))",
                       animationDelay: "1s"
                     }}>
                  <span className="text-3xl">🎯</span>
                </div>
                <h4 className="font-medium text-[var(--foreground)] mb-2">Personalized</h4>
                <p className="text-sm text-muted">Matches your preferences</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center floating"
                     style={{
                       background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.2))",
                       animationDelay: "2s"
                     }}>
                  <span className="text-3xl">✨</span>
                </div>
                <h4 className="font-medium text-[var(--foreground)] mb-2">Effortless</h4>
                <p className="text-sm text-muted">Quick and intuitive</p>
              </div>
            </div>

            {/* Premium CTA button */}
            <div className="flex justify-center animate-fade-in-up stagger-6">
              <button
                onClick={handleNext}
                className="group relative px-12 py-5 rounded-full font-semibold text-lg text-white
                         transition-all duration-500 hover:scale-105 hover:shadow-2xl
                         flex items-center gap-3 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                  boxShadow: "0 8px 32px rgba(90, 122, 90, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.2)"
                }}
              >
                {/* Button glow effect */}
                <span
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{
                    background: "linear-gradient(135deg, var(--sage-400), var(--sage-600))"
                  }}
                ></span>

                {/* Button content */}
                <span className="relative z-10 flex items-center gap-3">
                  <span>Let's Begin</span>
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

        {/* Decorative bottom text */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center animate-fade-in">
          <p className="text-sm text-muted">
            Crafted with care for your family
          </p>
        </div>
      </div>
    </div>
  );
}
