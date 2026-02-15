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
    <div className="min-h-screen overflow-hidden aurora">
      <div className="fixed inset-0 gradient-mesh particle-bg"></div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-24 left-[25%] w-96 h-96 rounded-full blur-3xl opacity-15 floating"
          style={{
            background: "radial-gradient(circle, var(--sage-400), transparent 70%)",
            animationDelay: "1.5s"
          }}
        ></div>
        <div
          className="absolute bottom-28 right-[20%] w-80 h-80 rounded-full blur-3xl opacity-20 floating"
          style={{
            background: "radial-gradient(circle, var(--gold-400), transparent 70%)",
            animationDelay: "3.5s"
          }}
        ></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-10 animate-fade-in">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '42%' }}></div>
          </div>
          <div className="text-center mt-3 text-sm font-medium text-muted">
            Step 3 of 7
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
                     background: "linear-gradient(135deg, rgba(217, 112, 72, 0.15), rgba(212, 175, 55, 0.15))",
                     boxShadow: "0 8px 32px rgba(217, 112, 72, 0.2)"
                   }}>
                <span className="text-4xl">✉️</span>
              </div>
            </div>

            <h1
              className="text-4xl sm:text-5xl font-light text-center mb-4 gradient-text animate-fade-in-up stagger-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Stay Connected
            </h1>

            <p className="text-center text-muted mb-10 animate-fade-in-up stagger-3">
              Choose how you'd like to receive updates from FamDish
            </p>

            <form onSubmit={updateEmail} className="space-y-8 animate-fade-in-up stagger-4">
              <div>
                <label
                  className="luxury-label text-base block mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Email Address for Notifications
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="luxury-input w-full text-lg"
                  placeholder="example@domain.com"
                  disabled={optOut}
                  style={{
                    background: optOut ? "rgba(200, 200, 200, 0.3)" : "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))",
                    backdropFilter: "blur(20px)",
                    border: "2px solid rgba(212, 175, 55, 0.2)",
                    boxShadow: "0 8px 24px rgba(212, 175, 55, 0.1), inset 0 2px 8px rgba(255, 255, 255, 0.5)"
                  }}
                />
              </div>

              <div className="glass-ultra rounded-2xl p-6">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <input
                    id="optout"
                    type="checkbox"
                    checked={optOut}
                    onChange={(e) => setOptOut(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-2 border-[var(--gold-400)]/30
                             text-[var(--primary)] focus:ring-2 focus:ring-[var(--gold-400)]/50"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-[var(--foreground)] block mb-1">
                      Opt out of notifications
                    </span>
                    <span className="text-sm text-muted">
                      You can change this anytime in your settings
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/profile/step1-1")}
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
            🔒 Your email is secure and will never be shared
          </p>
        </div>
      </div>
    </div>
  );
}
