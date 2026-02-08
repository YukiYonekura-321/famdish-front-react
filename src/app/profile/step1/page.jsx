"use client";

import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiClient } from "@/app/lib/api";

export default function ProfileStep1() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("ログインページに遷移します");
        router.replace("/login");
      }

      const res = await apiClient.get("/api/members/me");
      if (res?.data?.username) {
        // 本登録済み
        router.replace("/menus");
        return;
      }
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">Step 1</h1>
        <p className="mb-6">
          このステップは30秒で完了します。まず、あなたのことを教えてください。
        </p>

        <div className="flex justify-end">
          <Link
            href="/profile/step1-1"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            次へ
          </Link>
        </div>
      </div>
    </div>
  );
}
