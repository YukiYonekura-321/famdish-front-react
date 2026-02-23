"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/app/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthHeader } from "../../../components/auth_header";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MemberForm() {
  const [name, setName] = useState("");
  const [familyid, setFamilyId] = useState("");
  const [likes, setLikes] = useState([""]);
  const [dislikes, setDislikes] = useState([""]);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // ─── 選択候補 ───
  const likeCandidates = [
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
  const dislikeCandidates = [
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      try {
        const res = await apiClient.get("/api/members/me");
        setFamilyId(res?.data?.family_id);
      } catch (err) {
        console.error("メンバー情報取得失敗:", err);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleRemoveLike = (idx) => {
    setLikes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveDislike = (idx) => {
    setDislikes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("名前を入力してください");
      return;
    }

    try {
      const requestBody = {
        member: {
          name,
          likes_attributes: likes.filter((l) => l).map((l) => ({ name: l })),
          dislikes_attributes: dislikes
            .filter((d) => d)
            .map((d) => ({ name: d })),
        },
        link_user: false,
        family_id: familyid,
      };

      const res = await apiClient.post("/api/members", requestBody);
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
  };

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
              {/* 好きなもの */}
              <div>
                <label className="luxury-label text-sm flex items-center gap-1 mb-3">
                  <span>❤️</span> 好きなもの
                </label>

                {/* タグ選択 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {likeCandidates.map((item) => {
                    const selected = likes.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setLikes((prev) => prev.filter((l) => l !== item));
                          } else {
                            // 空の入力欄があればそこに入れる、なければ追加
                            const emptyIdx = likes.findIndex((l) => l === "");
                            if (emptyIdx !== -1) {
                              const newLikes = [...likes];
                              newLikes[emptyIdx] = item;
                              setLikes(newLikes);
                            } else {
                              setLikes([...likes, item]);
                            }
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-[var(--card)] text-muted border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* テキスト入力 */}
                <div className="space-y-2">
                  {likes.map((like, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={like}
                        placeholder="例：カレー"
                        onChange={(e) => {
                          const newLikes = [...likes];
                          newLikes[idx] = e.target.value;
                          setLikes(newLikes);
                        }}
                        className="luxury-select flex-1 text-sm"
                      />
                      {likes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLike(idx)}
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
                  onClick={() => setLikes([...likes, ""])}
                >
                  <span>＋</span>
                  <span>追加</span>
                </button>
              </div>

              {/* 嫌いなもの */}
              <div>
                <label className="luxury-label text-sm flex items-center gap-1 mb-3">
                  <span>💔</span> 嫌いなもの
                </label>

                {/* タグ選択 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {dislikeCandidates.map((item) => {
                    const selected = dislikes.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setDislikes((prev) =>
                              prev.filter((d) => d !== item),
                            );
                          } else {
                            const emptyIdx = dislikes.findIndex(
                              (d) => d === "",
                            );
                            if (emptyIdx !== -1) {
                              const newDislikes = [...dislikes];
                              newDislikes[emptyIdx] = item;
                              setDislikes(newDislikes);
                            } else {
                              setDislikes([...dislikes, item]);
                            }
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-[var(--card)] text-muted border-[var(--border)] hover:border-red-400 hover:text-red-400"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* テキスト入力 */}
                <div className="space-y-2">
                  {dislikes.map((dislike, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={dislike}
                        placeholder="例：ピーマン"
                        onChange={(e) => {
                          const newDislikes = [...dislikes];
                          newDislikes[idx] = e.target.value;
                          setDislikes(newDislikes);
                        }}
                        className="luxury-select flex-1 text-sm"
                      />
                      {dislikes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDislike(idx)}
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
                  onClick={() => setDislikes([...dislikes, ""])}
                >
                  <span>＋</span>
                  <span>追加</span>
                </button>
              </div>
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
