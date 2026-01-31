"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/api";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // 既に選択済みがあればAPIから取得して復元
    let unsub;
    try {
      unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        try {
          const res = await apiClient.get("/api/members");
          const members = res.data || [];
          const email = user.email;
          const member = members.find((m) => m.email === email) || members[0];
          const dislikes = member?.dislikes?.map((l) => l.name) || [];
          setSelected(dislikes);
        } catch (err) {
          console.error("既存選択の取得に失敗しました:", err);
        }
      });
    } catch (e) {
      console.error(e);
    }
    return () => unsub && unsub();
  }, []);

  const toggle = (opt) => {
    setSelected((prev) => {
      const exists = prev.includes(opt);
      return exists ? prev.filter((p) => p !== opt) : [...prev, opt];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 最終送信: 各ステップで保存した sessionStorage をまとめて送る
    const displayName = sessionStorage.getItem("profile_display_name") || "";
    const familyName =
      sessionStorage.getItem("profile_family_name") || "Default Family";
    const likes = JSON.parse(sessionStorage.getItem("profile_likes") || "[]");
    const dislikes = selected;

    try {
      const res = await apiClient.post("/api/members", {
        member: {
          name: displayName,
          likes_attributes: likes.filter((l) => l).map((l) => ({ name: l })),
          dislikes_attributes: dislikes
            .filter((d) => d)
            .map((d) => ({ name: d })),
        },
        family: {
          name: familyName || "Default Family",
        },
      });
      setMessage(`作成成功ID: ${res.data.id}`);
      // 送信後は一時データをクリア
      sessionStorage.removeItem("profile_display_name");
      sessionStorage.removeItem("profile_family_name");
      sessionStorage.removeItem("profile_likes");
      router.push("/menus");
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors || [
          error.response.data.error,
        ];
        setMessage(`エラー: ${errors.join(", ")}`);
      } else {
        setMessage("通信エラーが発生しました");
      }
    }
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
        {message && <p className="mt-4 small-note">{message}</p>}
      </div>
    </div>
  );
}
