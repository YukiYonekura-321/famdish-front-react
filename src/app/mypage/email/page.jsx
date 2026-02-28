"use client";

import { useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  verifyBeforeUpdateEmail,
  reauthenticateWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { getProvider } from "@/features/auth/lib/provider-utils";
import { auth } from "@/shared/lib/firebase";
import { AuthHeader } from "@/shared/components/auth_header";

// ── メインコンポーネント ──

export default function EmailChangePage() {
  const router = useRouter();
  const [currentEmail, setCurrentEmail] = useState("");

  // ── 認証 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentEmail(user.email || "");
      } else {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── メールアドレス変更 ──
  const handleUpdateEmail = useCallback(async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newEmail = form.elements.email.value;
    const user = auth.currentUser;
    if (!user) return;

    if (user.email === newEmail) {
      alert(`${newEmail}は登録済みです`);
      form.reset();
      return;
    }

    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
    };
    auth.language = "ja";
    const provider = getProvider(user);

    try {
      await reauthenticateWithPopup(user, provider);
      await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
      alert(
        `${newEmail}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`,
      );
      form.reset();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert(
          `${newEmail}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`,
        );
        form.reset();
        return;
      }
      alert(`メールの送信に失敗しました\n${error.message}`);
    }
  }, []);

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8 flex flex-col items-center">
        <div className="luxury-card max-w-md w-full text-center space-y-6">
          <h1
            className="text-2xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            メールアドレス変更
          </h1>

          <div>
            <p className="text-sm text-muted mb-1">現在のメールアドレス</p>
            <p className="text-[var(--foreground)] font-medium">
              {currentEmail}
            </p>
          </div>

          <form onSubmit={handleUpdateEmail} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="email"
                className="luxury-label text-sm block mb-2"
              >
                新しいメールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="luxury-input w-full"
                placeholder="example@email.com"
              />
            </div>
            <button
              type="submit"
              className="luxury-btn luxury-btn-primary w-full"
            >
              変更
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
