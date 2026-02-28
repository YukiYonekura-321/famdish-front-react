"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/shared/lib/api";
import { auth } from "@/shared/lib/firebase";
import { AuthHeader } from "@/shared/components/auth_header";
import {
  LIKE_CANDIDATES,
  DISLIKE_CANDIDATES,
} from "@/features/member/constants";
import { TagInputList } from "@/features/member/components/TagInputList";

// ── メインコンポーネント ──

export default function InviteMemberPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [likes, setLikes] = useState([""]);
  const [dislikes, setDislikes] = useState([""]);
  const [message, setMessage] = useState("");

  // ── 認証 & family_id 取得 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      try {
        const res = await apiClient.get("/api/members/me");
        setFamilyId(res?.data?.family_id ?? "");
      } catch (err) {
        console.error("メンバー情報取得失敗:", err);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── 送信 ──
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!name.trim()) {
        setMessage("名前を入力してください");
        return;
      }

      try {
        /* eslint-disable camelcase */
        const res = await apiClient.post("/api/members", {
          member: {
            name,
            likes_attributes: likes.filter(Boolean).map((l) => ({ name: l })),
            dislikes_attributes: dislikes
              .filter(Boolean)
              .map((d) => ({ name: d })),
          },
          link_user: false,
          family_id: familyId,
        });
        /* eslint-enable camelcase */

        setMessage(`✅ ${res.data.name}さんを登録しました！`);
        setTimeout(() => router.push("/members/index"), 1500);
      } catch (error) {
        if (error.response) {
          const errors = error.response.data.errors || [
            error.response.data.error,
          ];
          setMessage(`❌ エラー: ${errors.join(", ")}`);
        } else {
          setMessage("❌ 通信エラーが発生しました");
        }
      }
    },
    [name, likes, dislikes, familyId, router],
  );

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8">
        {/* ─── ヘッダー ─── */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1
            className="text-2xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            👨‍👩‍👧‍👦 家族メンバーを追加
          </h1>
          <p className="text-sm text-muted text-center max-w-lg">
            ログインできない家族（お子さまなど）を登録して、
            好みをAI提案に反映させましょう。
          </p>
          <Link
            href="/members/index"
            className="luxury-btn luxury-btn-outline flex items-center gap-2 text-sm"
          >
            <span>← メンバー一覧に戻る</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* ─── 名前 ─── */}
          <div className="luxury-card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏷️</span>
              <h2
                className="text-lg font-medium text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                基本情報
              </h2>
            </div>
            <div>
              <label className="luxury-label text-sm block mb-2">名前</label>
              <input
                type="text"
                placeholder="例：たろう"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="luxury-select w-full"
              />
            </div>
          </div>

          {/* ─── 好き嫌い ─── */}
          <div className="luxury-card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🍽️</span>
              <h2
                className="text-lg font-medium text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                食べ物の好み
              </h2>
            </div>
            <p className="text-sm text-muted mb-6">
              好きなもの・嫌いなものを登録すると、AI提案に反映されます。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TagInputList
                label="好きなもの"
                icon="❤️"
                items={likes}
                candidates={LIKE_CANDIDATES}
                placeholder="例：カレー"
                onChange={setLikes}
              />
              <TagInputList
                label="嫌いなもの"
                icon="💔"
                items={dislikes}
                candidates={DISLIKE_CANDIDATES}
                placeholder="例：ピーマン"
                onChange={setDislikes}
                selectedColor="bg-red-500 text-white border-red-500"
                hoverColor="hover:border-red-400 hover:text-red-400"
              />
            </div>
          </div>

          {/* ─── 送信ボタン ─── */}
          <button
            type="submit"
            className="luxury-btn luxury-btn-primary w-full"
          >
            この内容で登録する
          </button>

          {/* ─── メッセージ ─── */}
          {message && (
            <div
              className={`text-center text-sm p-3 rounded-lg ${
                message.startsWith("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
