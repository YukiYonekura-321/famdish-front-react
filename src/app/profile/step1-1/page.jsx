"use client";

import { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileStep1() {
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
      }
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 一時保存して次のページへ（最終ページでまとめて送信する）
      sessionStorage.setItem("profile_display_name", displayName);
      setMessage(`保存しました: ${displayName}`);
      router.push("/profile/step1-2");
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors || [
          error.response.data.error,
        ];
        // Railsの422エラーや401エラーなどのレスポンスがある場合
        setMessage(`エラー: ${errors.join(", ")}`);
      } else {
        setMessage("通信エラーが発生しました");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">
          あなたの表示名を決めましょう
        </h1>
        <p className="mb-4">後から変更できます。</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">表示名</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="gra-input w-full"
            placeholder="例: さくら"
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-auto px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => router.push("/profile/step1")}
            >
              戻る
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              次へ
            </button>
          </div>
        </form>

        {message && <p className="mt-4 small-note">{message}</p>}
      </div>
    </div>
  );
}
