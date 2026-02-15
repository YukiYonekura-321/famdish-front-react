"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  verifyBeforeUpdateEmail,
  reauthenticateWithPopup,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { getProvider } from "@/app/lib/provider-utils";
import { apiClient } from "@/app/lib/api";

export default function ProfileStep1_2() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [optOut, setOptOut] = useState(false);
  const [linkedEmails, setLinkedEmails] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLinkedEmails(user.email);
        try {
          const res = await apiClient.get("/api/members/me");
          if (res?.data?.username) router.replace("/menus");
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      } else {
        setLinkedEmails([]);
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!email && linkedEmails) {
      setEmail(linkedEmails);
    }
  }, [linkedEmails, email]);

  const updateEmail = async (e) => {
    e.preventDefault();
    const inputEmail = email;
    const actionCodeSettings = {
      url: `http://${location.host}/login`,
    };

    auth.languageCode = "ja";
    const user = auth.currentUser;

    if (user.email === inputEmail) {
      router.push("/profile/step2");
      return;
    }

    const provider = getProvider(user);

    try {
      await reauthenticateWithPopup(user, provider);
      await verifyBeforeUpdateEmail(user, inputEmail, actionCodeSettings);
      alert(
        `${email}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`,
      );
      setEmail("");
      router.push("/profile/step2");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert(
          `${email}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`,
        );
        setEmail("");
        return;
      }
      alert(`メールの送信に失敗しました\n${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream-50)] via-white to-[var(--sage-50)]">
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 sm:px-6 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]">
                プロフィール登録
              </span>
              <span className="text-xs sm:text-sm text-muted">ステップ 3/7</span>
            </div>
            <div className="h-2 bg-[var(--cream-100)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--sage-400)] to-[var(--sage-500)] transition-all duration-500 ease-out"
                style={{ width: "42%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-24 sm:mt-28">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--cream-200)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[var(--terracotta-400)] via-[var(--gold-400)] to-[var(--sage-400)]"></div>

            <div className="p-6 sm:p-8 md:p-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[var(--terracotta-100)] to-[var(--gold-100)] mb-4">
                  <span className="text-3xl sm:text-4xl">✉️</span>
                </div>
              </div>

              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-light text-center mb-3 sm:mb-4 text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                通知メールの設定
              </h1>

              <p className="text-sm sm:text-base text-center text-muted mb-8 sm:mb-10">
                FamDishからのお知らせを受け取るメールアドレスを設定します
              </p>

              <form onSubmit={updateEmail} className="space-y-6 sm:space-y-8">
                <div>
                  <label
                    className="block text-sm sm:text-base font-medium text-[var(--foreground)] mb-2 sm:mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 border-[var(--cream-200)]
                             focus:border-[var(--sage-400)] focus:ring-4 focus:ring-[var(--sage-100)]
                             transition-all duration-200 text-base sm:text-lg bg-white disabled:bg-gray-100 min-h-[44px]"
                    placeholder="example@domain.com"
                    disabled={optOut}
                  />
                </div>

                <div className="bg-[var(--cream-50)] border border-[var(--gold-200)] rounded-xl p-4 sm:p-5">
                  <label className="flex items-start gap-3 sm:gap-4 cursor-pointer">
                    <input
                      id="optout"
                      type="checkbox"
                      checked={optOut}
                      onChange={(e) => setOptOut(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-2 border-[var(--gold-400)]
                               text-[var(--primary)] focus:ring-2 focus:ring-[var(--gold-400)]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium text-[var(--foreground)] mb-1">
                        通知を受け取らない
                      </span>
                      <span className="block text-sm text-muted">
                        後から設定で変更できます
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/profile/step1-1")}
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
              🔒 メールアドレスは安全に保管されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
