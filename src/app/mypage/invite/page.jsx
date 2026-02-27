"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/app/lib/api";
import { auth } from "@/app/lib/firebase";
import { AuthHeader } from "@/components/auth_header";

// ── 定数 ──

const LIKE_CANDIDATES = [
  "カレー",
  "ハンバーグ",
  "唐揚げ",
  "ラーメン",
  "寿司",
  "焼肉",
  "オムライス",
  "パスタ",
  "ピザ",
  "餃子",
  "コロッケ",
  "グラタン",
  "うどん",
  "とんかつ",
  "焼きそば",
  "チャーハン",
  "肉じゃが",
  "シチュー",
  "たこ焼き",
  "エビフライ",
];

const DISLIKE_CANDIDATES = [
  "ピーマン",
  "にんじん",
  "トマト",
  "セロリ",
  "なす",
  "しいたけ",
  "ネギ",
  "ゴーヤ",
  "パクチー",
  "レバー",
  "グリンピース",
  "ほうれん草",
  "玉ねぎ",
  "魚全般",
  "牛乳",
  "チーズ",
  "納豆",
  "漬物",
  "辛いもの",
  "酸っぱいもの",
];

// ── サブコンポーネント ──

/** タグ選択 + テキスト入力の共通コンポーネント */
function TagInputList({
  label,
  icon,
  items,
  candidates,
  placeholder,
  onChange,
  selectedColor = "bg-[var(--primary)] text-white border-[var(--primary)]",
  hoverColor = "hover:border-[var(--primary)] hover:text-[var(--primary)]",
}) {
  const handleToggleTag = (tag) => {
    if (items.includes(tag)) {
      onChange(items.filter((v) => v !== tag));
    } else {
      const emptyIdx = items.findIndex((v) => v === "");
      if (emptyIdx !== -1) {
        const next = [...items];
        next[emptyIdx] = tag;
        onChange(next);
      } else {
        onChange([...items, tag]);
      }
    }
  };

  const handleChangeAt = (idx, value) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };

  const handleRemoveAt = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="luxury-label text-sm flex items-center gap-1 mb-3">
        <span>{icon}</span> {label}
      </label>

      {/* タグ選択 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {candidates.map((tag) => {
          const selected = items.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleToggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selected
                  ? selectedColor
                  : `bg-[var(--card)] text-muted border-[var(--border)] ${hoverColor}`
              }`}
            >
              {selected ? "✓ " : ""}
              {tag}
            </button>
          );
        })}
      </div>

      {/* テキスト入力 */}
      <div className="space-y-2">
        {items.map((value, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={value}
              placeholder={placeholder}
              onChange={(e) => handleChangeAt(idx, e.target.value)}
              className="luxury-select flex-1 text-sm"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveAt(idx)}
                className="text-muted hover:text-red-500 transition-colors text-lg px-1"
                title="削除"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-2 text-sm text-[var(--primary)] hover:opacity-80 transition-opacity flex items-center gap-1"
        onClick={() => onChange([...items, ""])}
      >
        <span>＋</span>
        <span>追加</span>
      </button>
    </div>
  );
}

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
