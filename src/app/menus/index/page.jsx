"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSuggestion } from "@/hooks/useSuggestion";
import { useFeedback } from "@/hooks/useFeedback";
import SuggestionCard from "@/components/SuggestionCard";
import { AuthHeader } from "@/components/auth_header";
import { useRouter } from "next/navigation";
import React from "react";

export default function MenuIndex() {
  const [menu, setMenu] = useState([]);
  const [usertoken, setUsertoken] = useState("");
  const { loading, suggestions, fetchSuggestions } = useSuggestion();
  const { saveFeedback } = useFeedback();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUsertoken(token);
      } else {
        setUsertoken("");
        router.replace("/login");
      }
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, [router]);

  // トークンが変わったらメンバーを取得
  useEffect(() => {
    if (!usertoken) return; // tokenが空なら呼ばない

    const loadMenu = async () => {
      try {
        const res = await apiClient.get("/api/menus");
        console.log(res.data);
        setMenu(res.data);
      } catch (error) {
        console.error("メニューの取得に失敗しました:", error);
      }
    };

    loadMenu();
  }, [usertoken]); // ← 依存配列に usertoken を入

  return (
    <div className="gra-page p-8 flex flex-col items-center">
      <AuthHeader />

      <div className="w-full flex flex-col items-center gap-6 mt-12">
        <h1 className="text-2xl font-bold gra-title">
          リクエストされたメニュー(一覧)
        </h1>

        <div className="w-full flex flex-col items-center gap-4 mt-6">
          {menu.map((m) => (
            <div
              key={m.id}
              className="w-11/12 sm:w-3/4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <Link href={`/menus/${m.id}`} className="w-full sm:w-auto">
                <div className="gra-card w-full cursor-pointer">
                  <div>{m.name}</div>
                  {m.member && (
                    <div className="text-sm text-gray-600 mt-1">
                      提案者: {m.member.name}
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  className="gra-btn"
                  onClick={() => fetchSuggestions(m.name)}
                >
                  提案を取得する
                </button>

                <button
                  className="px-3 py-2 bg-yellow-400 text-black rounded hover:brightness-95"
                  onClick={() => {
                    setEditingId(m.id);
                    setEditingValue(m.name);
                    setShowEditModal(true);
                  }}
                >
                  編集
                </button>

                <button
                  className="px-3 py-2 bg-red-500 text-white rounded hover:brightness-90"
                  onClick={async () => {
                    if (!confirm("本当に削除しますか？")) return;
                    try {
                      await apiClient.delete(`/api/menus/${m.id}`);
                      setMenu((prev) => prev.filter((it) => it.id !== m.id));
                    } catch (err) {
                      console.error("削除に失敗しました", err);
                      alert("削除に失敗しました");
                    }
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 編集モーダル */}
        {showEditModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">メニューを編集</h2>
              <input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="gra-input w-full mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                  onClick={() => setShowEditModal(false)}
                >
                  キャンセル
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={async () => {
                    try {
                      await apiClient.patch(`/api/menus/${editingId}`, {
                        menu: { name: editingValue },
                      });
                      setMenu((prev) =>
                        prev.map((it) =>
                          it.id === editingId
                            ? { ...it, name: editingValue }
                            : it,
                        ),
                      );
                      setShowEditModal(false);
                    } catch (err) {
                      console.error("更新に失敗しました", err);
                      alert("更新に失敗しました");
                    }
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && <p className="text-sm text-gray-600">提案を生成中です…</p>}
        {/* 提案カード一覧 */}

        {suggestions && (
          <div className="mt-4 grid gap-4">
            <SuggestionCard
              suggestion={suggestions.suggest_field}
              onOk={async () => {
                await saveFeedback(suggestions.id, "ok", "");
                alert("採用しました");
              }}
              onRetry={async () => {
                await saveFeedback(suggestions.id, "alt", "");
                alert("別案を要求しました");
                fetchSuggestions(
                  suggestions.suggest_field.requests,
                  suggestions.id,
                );
              }}
              onNg={async () => {
                const reason = prompt("NG 理由を入力してください（任意）:");
                await saveFeedback(suggestions.id, "ng", reason || "");
                alert("NG理由を送信しました");
                fetchSuggestions(
                  suggestions.suggest_field.requests,
                  suggestions.id,
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
