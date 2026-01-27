"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = [
  "にんじん",
  "ピーマン",
  "トマト",
  "納豆",
  "辛いもの",
  "苦いもの",
  "生魚",
  "シーフード",
  "チーズ",
  "卵料理",
  "揚げ物",
  "味の濃い物",
  "香辛料",
  "豆腐",
  "海藻",
  "レバー",
  "内臓系",
  "きのこ",
  "牛肉",
  "豚肉",
];

export default function ProfileStep3DisLike() {
  const [selected, setSelected] = useState([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("profile_dislikes");
      if (raw) setSelected(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const toggle = (opt) => {
    setSelected((prev) => {
      const exists = prev.includes(opt);
      return exists ? prev.filter((p) => p !== opt) : [...prev, opt];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 保存: 簡易に sessionStorage に保存（必要なら API 呼び出しに置換）
    sessionStorage.setItem("profile_dislikes", JSON.stringify(selected));
    router.push("/menus");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">あなたの嫌いなもの</h1>
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
              onClick={() => router.push("/profile/step3-1")}
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
                完了
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
