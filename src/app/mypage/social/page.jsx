"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { AuthHeader } from "@/components/auth_header";
import { ProviderLinkTable } from "@/components/ProviderLinkTable";
import { useRouter } from "next/navigation";

// LoginPage というReactコンポーネントを定義
// ボタンを表示して、クリックすると login 関数が呼ばれ、Googleログイン開始
export default function MyPage() {
  const [authUser, setauthUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setauthUser(user);
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, [router]);

  return (
    <div className="relative w-full min-h-screen p-8">
      <AuthHeader />
      <div className="relative w-full min-h-screen p-8">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex-col text-center space-y-8">
          <h2 className="text-2xl md:text-4xl font-bold drop-shadow-lg">
            連携状態
          </h2>
          {authUser && <ProviderLinkTable user={authUser} />}
        </div>
      </div>
    </div>
  );
}
