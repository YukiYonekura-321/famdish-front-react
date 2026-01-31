"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/api";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const OPTIONS = [
  "寿司",
  "カレー",
  "ピザ",
  "パスタ",
  "パン",
  "肉料理",
  "魚料理",
  "野菜",
  "果物",
  "デザート",
  "チーズ",
  "卵料理",
  "豆腐",
  "サラダ",
  "スープ",
  "シーフード",
  "和食",
  "洋食",
  "中華",
  "辛いもの",
];

export default function ProfileStep3Like() {
  const [selected, setSelected] = useState([]);
  const router = useRouter();

  const toggle = (opt) => {
    setSelected((prev) => {
      const exists = prev.includes(opt);
      return exists ? prev.filter((p) => p !== opt) : [...prev, opt];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 保存: 簡易に sessionStorage に保存（必要なら API 呼び出しに置換）
    sessionStorage.setItem("profile_likes", JSON.stringify(selected));
    router.push("/profile/step3-2");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">あなたの好きなもの</h1>
        <p className="mb-4">
          下の選択肢から当てはまるものを選んでください（複数可）。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {OPTIONS.map((opt) => (
              <label
                key={opt}
                className="flex items-center space-x-2 p-2 border rounded"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => router.push("/profile/step3")}
            >
              戻る
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                選択: {selected.length}
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                次へ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
