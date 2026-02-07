"use client";

import { onAuthStateChanged } from "firebase/auth";
import { AuthHeader } from "@/components/auth_header";
import { deleteUser } from "@/app/lib/delete-user";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// LoginPage というReactコンポーネントを定義
// ボタンを表示して、クリックすると login 関数が呼ばれ、Googleログイン開始
export default function MyPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
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
          <h2 className="text-2xl font-bold drop-shadow-lg">退会</h2>
          <p>メールアドレス、連携状態が破棄されます</p>
          <button
            className="px-4 py-2 inline-block bg-sky-500 opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              deleteUser();
            }}
          >
            退会
          </button>
        </div>
      </div>
    </div>
  );
}
