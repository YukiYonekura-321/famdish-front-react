"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";

export default function ProfileStep2() {
  const [message, setMessage] = useState("");
  const [familyName, setFamilyName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // 招待経由の場合はスキップして直接 step3 へ
    const isFromInvitation = sessionStorage.getItem("from_invitation");
    if (isFromInvitation === "true") {
      const invitedFamilyName = sessionStorage.getItem("invited_family_name");
      sessionStorage.setItem("profile_family_name", invitedFamilyName || "");
      // step3 へスキップ
      router.replace("/profile/step3");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
      }

      const res = await apiClient.get("/api/members/me");
      if (res?.data?.username) {
        // 本登録済み
        router.replace("/menus");
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 一時保存して次のページへ（最終ページでまとめて送信する）
      sessionStorage.setItem(
        "profile_family_name",
        familyName || "Default Family",
      );
      setMessage(`保存しました: ${familyName}`);
      router.push("/profile/step3");
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
          あなたの家族名を決めましょう
        </h1>
        <p className="mb-4">家族名を入力してください。</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">家族名</label>
          <input
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="gra-input w-full"
            placeholder="例: 田中家"
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-auto px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => router.push("/profile/step1-2")}
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
