"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { AuthHeader } from "@/components/auth_header";
import { ProviderLinkTable } from "@/components/ProviderLinkTable";

export default function SocialPage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);

  // ── 認証 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setAuthUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container flex flex-col items-center gap-8 min-h-[70vh] justify-center">
        <div className="text-center space-y-4">
          <h1
            className="text-3xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🔗 連携状態
          </h1>
          <p className="text-sm text-muted">
            外部サービスとの連携状況を確認・管理できます。
          </p>
        </div>

        {authUser && <ProviderLinkTable user={authUser} />}
      </div>
    </div>
  );
}
