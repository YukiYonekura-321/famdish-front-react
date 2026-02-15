"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/api";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

const OPTIONS = [
  "にんじん",
  "ピーマン",
  "トマト",
  "納豆",
  "辛いもの",
  "苦いもの",
  "生魚",
  "シーフード",
  "チーズ",
  "卵料理",
  "揚げ物",
  "味の濃い物",
  "香辛料",
  "豆腐",
  "海藻",
  "レバー",
  "内臓系",
  "きのこ",
  "牛肉",
  "豚肉",
];

export default function ProfileStep3_2() {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    const displayName = sessionStorage.getItem("profile_display_name") || "";
    const familyId = sessionStorage.getItem("invited_family_id") || null;
    const familyName =
      sessionStorage.getItem("profile_family_name") || "Default Family";
    const likes = JSON.parse(sessionStorage.getItem("profile_likes") || "[]");
    const dislikes = selected;

    try {
      const requestBody = {
        member: {
          name: displayName,
          likes_attributes: likes.filter((l) => l).map((l) => ({ name: l })),
          dislikes_attributes: dislikes
            .filter((d) => d)
            .map((d) => ({ name: d })),
        },
      };

      if (familyId) {
        requestBody.family_id = familyId;
      } else {
        requestBody.family = {
          name: familyName || "Default Family",
        };
      }

      const res = await apiClient.post("/api/members", requestBody);
      setMessage(`作成成功ID: ${res.data.id}`);
      sessionStorage.removeItem("profile_display_name");
      sessionStorage.removeItem("profile_family_name");
      sessionStorage.removeItem("profile_likes");
      sessionStorage.removeItem("from_invitation");
      sessionStorage.removeItem("invited_family_name");
      sessionStorage.removeItem("invited_family_id");
      router.push("/menus");
    } catch (error) {
      setIsSubmitting(false);
      if (error.response) {
        const errors = error.response.data.errors || [
          error.response.data.error,
        ];
        setMessage(`エラー: ${errors.join(", ")}`);
      } else {
        setMessage("通信エラーが発生しました");
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden aurora">
      <div className="fixed inset-0 gradient-mesh particle-bg"></div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-12 right-[10%] w-72 h-72 rounded-full blur-3xl opacity-16 floating"
          style={{
            background: "radial-gradient(circle, var(--terracotta-400), transparent 70%)",
            animationDelay: "0.5s"
          }}
        ></div>
        <div
          className="absolute bottom-20 left-[14%] w-88 h-88 rounded-full blur-3xl opacity-20 floating"
          style={{
            background: "radial-gradient(circle, var(--gold-400), transparent 70%)",
            animationDelay: "2.2s"
          }}
        ></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6 py-24">
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-10 animate-fade-in">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
          <div className="text-center mt-3 text-sm font-medium text-[var(--primary)]">
            Final Step • 7 of 7
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
                     background: "linear-gradient(135deg, rgba(217, 112, 72, 0.2), rgba(212, 175, 55, 0.15))",
                     boxShadow: "0 8px 32px rgba(217, 112, 72, 0.25)"
                   }}>
                <span className="text-4xl">🚫</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-light mb-4 gradient-text"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Anything to Avoid?
              </h1>

              <p className="text-muted text-lg">
                Select foods or ingredients you prefer not to include (optional)
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
                          ? "linear-gradient(135deg, var(--terracotta-100), var(--terracotta-200))"
                          : "linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))",
                        backdropFilter: "blur(20px)",
                        border: isSelected
                          ? "2px solid var(--terracotta-400)"
                          : "2px solid rgba(212, 175, 55, 0.15)",
                        boxShadow: isSelected
                          ? "0 8px 24px rgba(217, 112, 72, 0.25), inset 0 2px 8px rgba(255, 255, 255, 0.5)"
                          : "0 4px 12px rgba(212, 175, 55, 0.08), inset 0 2px 8px rgba(255, 255, 255, 0.5)",
                        animationDelay: `${idx * 0.03}s`
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--secondary)]
                                     flex items-center justify-center animate-scale-in">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      <span className={`text-base transition-colors ${
                        isSelected ? "text-[var(--secondary)]" : "text-[var(--foreground)]"
                      }`}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="glass-ultra rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{selected.length > 0 ? "✅" : "👍"}</span>
                  <div>
                    <span className="font-semibold text-[var(--primary)] text-xl"
                          style={{ fontFamily: "var(--font-display)" }}>
                      {selected.length}
                    </span>
                    <span className="text-muted ml-2">items to avoid</span>
                  </div>
                </div>
              </div>

              {message && (
                <div className={`glass-ultra rounded-xl p-4 text-center animate-fade-in ${
                  message.includes("エラー") ? "border-2 border-[var(--secondary)]" : ""
                }`}>
                  <p className={`text-sm ${
                    message.includes("エラー") ? "text-[var(--secondary)]" : "text-[var(--primary)]"
                  }`}>
                    {message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/profile/step3-1")}
                  disabled={isSubmitting}
                  className="group relative px-8 py-4 rounded-full font-medium text-[var(--foreground)]
                           transition-all duration-300 hover:scale-105 flex-1 disabled:opacity-50 disabled:cursor-not-allowed
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
                  disabled={isSubmitting}
                  className="group relative px-12 py-5 rounded-full font-semibold text-lg text-white
                           transition-all duration-500 hover:scale-105 hover:shadow-2xl flex-1
                           flex items-center justify-center gap-3 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitting
                      ? "linear-gradient(135deg, var(--gold-400) 0%, var(--gold-500) 100%)"
                      : "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                    boxShadow: isSubmitting
                      ? "0 8px 32px rgba(212, 175, 55, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)"
                      : "0 8px 32px rgba(90, 122, 90, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{
                      background: isSubmitting
                        ? "linear-gradient(135deg, var(--gold-400), var(--gold-600))"
                        : "linear-gradient(135deg, var(--sage-400), var(--sage-600))"
                    }}
                  ></span>

                  <span className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Creating Your Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>🎉</span>
                        <span>Complete Setup</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center animate-fade-in">
          <p className="text-sm text-muted font-medium">
            ✨ You're all set! Get ready for personalized menu magic
          </p>
        </div>
      </div>
    </div>
  );
}
