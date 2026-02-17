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
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream-50)] via-white to-[var(--sage-50)]">
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 py-28 sm:py-32">
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 sm:px-6 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-[var(--primary)]">
                プロフィール登録
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[var(--primary)]">
                最終ステップ • 7/7
              </span>
            </div>
            <div className="h-2 bg-[var(--cream-100)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--sage-400)] to-[var(--sage-500)] transition-all duration-500 ease-out"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--cream-200)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[var(--terracotta-400)] via-[var(--gold-400)] to-[var(--sage-400)]"></div>

            <div className="p-6 sm:p-8 md:p-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[var(--terracotta-100)] to-[var(--gold-100)] mb-4">
                  <span className="text-3xl sm:text-4xl">🚫</span>
                </div>

                <h1
                  className="text-2xl sm:text-3xl md:text-4xl font-light mb-3 sm:mb-4 text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  苦手なものを選んでください
                </h1>

                <p className="text-sm sm:text-base text-muted">
                  複数選択できます（選択は任意です）。後から変更できます。
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
                        disabled={isSubmitting}
                        className={`relative p-3 sm:p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                                 text-center font-medium text-sm sm:text-base min-h-[44px] flex items-center justify-center disabled:opacity-50 ${
                                   isSelected
                                     ? "bg-gradient-to-br from-[var(--terracotta-100)] to-[var(--terracotta-200)] border-2 border-[var(--terracotta-400)] shadow-md"
                                     : "bg-white border-2 border-[var(--cream-200)] hover:border-[var(--terracotta-300)]"
                                 }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--secondary)] flex items-center justify-center">
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        )}
                        <span
                          className={
                            isSelected
                              ? "text-[var(--secondary)]"
                              : "text-[var(--foreground)]"
                          }
                        >
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`border rounded-xl p-4 sm:p-5 text-center ${
                    selected.length > 0
                      ? "bg-[var(--terracotta-50)] border-[var(--terracotta-200)]"
                      : "bg-[var(--sage-50)] border-[var(--sage-200)]"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">
                      {selected.length > 0 ? "✅" : "👍"}
                    </span>
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

                {message && (
                  <div
                    className={`rounded-xl p-4 text-center ${
                      message.includes("エラー")
                        ? "bg-red-50 border-2 border-red-200"
                        : "bg-[var(--sage-50)] border border-[var(--sage-200)]"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        message.includes("エラー")
                          ? "text-red-600"
                          : "text-[var(--primary)]"
                      }`}
                    >
                      {message}
                    </p>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/profile/step3-1")}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 px-6 py-3 sm:py-4 rounded-xl font-medium text-[var(--foreground)]
                             bg-[var(--cream-100)] hover:bg-[var(--cream-200)] border-2 border-[var(--cream-200)]
                             transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
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
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg text-white
                             transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                             flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed min-h-[44px]"
                    style={{
                      background: isSubmitting
                        ? "linear-gradient(135deg, var(--gold-400) 0%, var(--gold-500) 100%)"
                        : "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>登録中...</span>
                      </>
                    ) : (
                      <>
                        <span>🎉</span>
                        <span>登録完了</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <p className="text-sm font-medium text-[var(--primary)]">
              ✨ 準備完了！素敵な献立をお楽しみください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
