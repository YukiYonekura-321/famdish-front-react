"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileStep2() {
  const [familyName, setFamilyName] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 保存処理（API 呼び出し等）をここに追加
    router.push("/profile/step3");
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
              onClick={() => router.push("/profile/step1-1")}
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
      </div>
    </div>
  );
}
