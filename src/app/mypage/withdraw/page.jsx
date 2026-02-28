"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { AuthHeader } from "@/shared/components/auth_header";
import { deleteUser } from "@/features/auth/lib/delete-user";

export default function WithdrawPage() {
  const router = useRouter();

  // ── 認証 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── 退会処理 ──
  const handleWithdraw = useCallback(() => {
    deleteUser();
  }, []);

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container flex flex-col items-center gap-6 min-h-[70vh] justify-center">
        <div className="text-center space-y-6">
          <h1
            className="text-3xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ⚠️ 退会
          </h1>
          <p className="text-sm text-muted">
            メールアドレス、連携状態が破棄されます。
            <br />
            この操作は取り消せません。
          </p>
          <button
            onClick={handleWithdraw}
            className="luxury-btn bg-red-500 hover:bg-red-600 text-white"
          >
            退会する
          </button>
        </div>
      </div>
    </div>
  );
}
