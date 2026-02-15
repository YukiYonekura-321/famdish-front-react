"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSuggestion } from "@/hooks/useSuggestion";
import { useFeedback } from "@/hooks/useFeedback";
import SuggestionCard from "@/components/SuggestionCard";
import { AuthHeader } from "../../components/auth_header";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MenuPage() {
  // ── 共通 state ──
  const [usertoken, setUsertoken] = useState("");
  const router = useRouter();
  const suggestionsRef = useRef(null);

  // ── 作成フォーム用 state ──
  const [newMenu, setNewMenu] = useState("");
  const [message, setMessage] = useState("");
  const [likes, setLikes] = useState([]);

  // ── 一覧用 state ──
  const [menuList, setMenuList] = useState([]);
  const { loading, suggestions, fetchSuggestions } = useSuggestion();
  const { saveFeedback } = useFeedback();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [goodStatus, setGoodStatus] = useState({});
  const [goodCount, setGoodCount] = useState({});

  // ── 料理担当者関連 state ──
  const [members, setMembers] = useState([]);
  const [todayCookId, setTodayCookId] = useState(null);
  const [cookSelectMessage, setCookSelectMessage] = useState("");
  const [suggestionError, setSuggestionError] = useState("");

  // ── 認証 ──
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
    return () => unsubscribe();
  }, [router]);

  // ── メンバー一覧とファミリー情報取得 ──
  useEffect(() => {
    if (!usertoken) return;

    const fetchFamilyInfo = async () => {
      try {
        // メンバー一覧取得
        const membersRes = await apiClient.get("/api/members");
        const membersList = Array.isArray(membersRes.data)
          ? membersRes.data
          : [];
        setMembers(membersList);

        // ファミリー情報取得（today_cook_id）
        const familyRes = await apiClient.get("/api/families");
        const familyData = familyRes.data;
        setTodayCookId(familyData.today_cook_id || null);
      } catch (error) {
        console.error("ファミリー情報取得失敗:", error);
      }
    };

    fetchFamilyInfo();
  }, [usertoken]);

  // ── データ読み込み（likes + menus + good） ──
  useEffect(() => {
    if (!usertoken) return;

    // likes 一覧取得（作成フォーム用）
    const fetchLikes = async () => {
      try {
        const res = await apiClient.get("/api/likes");
        setLikes(res.data || []);
      } catch (e) {
        setLikes([]);
        console.error("likes 取得失敗:", e);
      }
    };

    // メニュー一覧 + good チェック + count
    const loadMenus = async () => {
      try {
        const res = await apiClient.get("/api/menus");
        const menus = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];
        setMenuList(menus);

        const goodStatusMap = {};
        const goodCountMap = {};
        for (const m of menus) {
          try {
            const goodRes = await apiClient.get("/api/goods/check", {
              params: { menu_id: m.id },
            });
            goodStatusMap[m.id] = {
              exists: goodRes.data.exists,
              good_id: goodRes.data.good?.id || null,
            };
          } catch (err) {
            console.error(`good チェック失敗 (menu_id: ${m.id}):`, err);
            goodStatusMap[m.id] = { exists: false, good_id: null };
          }

          try {
            const countRes = await apiClient.get("/api/goods/count", {
              params: { menu_id: m.id },
            });
            goodCountMap[m.id] = Number(countRes.data.count) || 0;
          } catch (err) {
            console.error(`good count 取得失敗 (menu_id: ${m.id}):`, err);
            goodCountMap[m.id] = 0;
          }
        }
        setGoodStatus(goodStatusMap);
        setGoodCount(goodCountMap);
      } catch (error) {
        console.error("メニューの取得に失敗しました:", error);
      }
    };

    fetchLikes();
    loadMenus();
  }, [usertoken]);

  // ── メニュー作成 ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usertoken) {
      alert("ログインしてください");
      return;
    }
    try {
      const res = await apiClient.post("/api/menus", {
        menu: { name: newMenu },
      });
      setMessage(
        `リクエスト成功 — ID: ${res.data.id}, 名前: ${res.data.name || res.data.menu}`,
      );
      setNewMenu("");
      // 一覧を再読み込み
      const listRes = await apiClient.get("/api/menus");
      setMenuList(Array.isArray(listRes.data) ? listRes.data : []);
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors || [
          "不明なエラーが発生しました",
        ];
        setMessage("リクエストに失敗しました:\n" + errors.join("\n"));
      } else {
        setMessage("リクエストに失敗しました: ネットワークエラー");
      }
    }
  };

  // ── ハート（good）トグル ──
  const handleToggleGood = async (menuId) => {
    try {
      if (goodStatus[menuId]?.exists) {
        const goodId = goodStatus[menuId].good_id;
        await apiClient.delete(`/api/goods/${goodId}`);
        setGoodStatus((prev) => ({
          ...prev,
          [menuId]: { exists: false, good_id: null },
        }));
        setGoodCount((prev) => ({
          ...prev,
          [menuId]: Math.max((prev[menuId] || 0) - 1, 0),
        }));
      } else {
        const res = await apiClient.post("/api/goods", {
          good: { menu_id: menuId },
        });
        setGoodStatus((prev) => ({
          ...prev,
          [menuId]: { exists: true, good_id: res.data.id },
        }));
        setGoodCount((prev) => ({
          ...prev,
          [menuId]: (prev[menuId] || 0) + 1,
        }));
      }
    } catch (err) {
      console.error("good トグル失敗:", err);
      alert("いいね操作に失敗しました");
    }
  };

  // ── 料理担当者選択 ──
  const handleSelectCook = async (memberId) => {
    try {
      setCookSelectMessage("");
      await apiClient.post("/api/families/assign_cook", {
        member_id: memberId,
      });
      setTodayCookId(memberId);
      setCookSelectMessage(
        "料理担当者を設定しました（提案ボタンは担当者のみ有効です）",
      );
      setTimeout(() => setCookSelectMessage(""), 3000);
    } catch (error) {
      console.error("料理担当者設定失敗:", error);
      setCookSelectMessage("料理担当者の設定に失敗しました");
    }
  };

  // ── 献立提案（提案ボタン）──
  const handleFetchSuggestions = async (menuName) => {
    setSuggestionError("");
    // スクロールして提案セクションまで移動
    setTimeout(() => {
      suggestionsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
    try {
      await fetchSuggestions(menuName);
    } catch (error) {
      if (error.status === 403) {
        setSuggestionError("今日の料理担当者ではありません");
      } else {
        setSuggestionError("提案取得に失敗しました");
      }
    }
  };

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8">
        {/* ─── 過去の献立リンク ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/menus/familysuggestion"
            className="luxury-btn luxury-btn-secondary flex items-center gap-2"
          >
            <span>🏠</span>
            <span>わが家の過去の献立</span>
          </Link>
          <Link
            href="/menus/familysuggestion/suggestion"
            className="luxury-btn luxury-btn-outline flex items-center gap-2"
          >
            <span>🌍</span>
            <span>みんなの献立を参考にする</span>
          </Link>
        </div>

        {/* ─── 料理担当者選択 ─── */}
        <div className="luxury-card max-w-2xl mx-auto mb-12">
          <label className="luxury-label text-center block mb-4">
            今日の料理担当者
          </label>
          <select
            value={todayCookId || ""}
            onChange={(e) => handleSelectCook(Number(e.target.value) || null)}
            className="luxury-select"
          >
            <option value="">選択してください</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {cookSelectMessage && (
            <p className="text-sm text-[var(--primary)] mt-3 text-center">
              {cookSelectMessage}
            </p>
          )}
        </div>

        {/* ─── リクエスト作成フォーム ─── */}
        <h1 className="luxury-title">食べたいものをリクエストしよう！</h1>

        <form
          onSubmit={handleSubmit}
          className="luxury-card max-w-2xl mx-auto space-y-6 mb-12"
        >
          <label className="luxury-label">リクエスト内容</label>

          <select
            value={newMenu}
            onChange={(e) => setNewMenu(e.target.value)}
            className="luxury-select"
          >
            <option value="">選択してください</option>
            {likes.map((like) => (
              <option key={like.id} value={like.name}>
                {like.name}
              </option>
            ))}
          </select>

          <p className="text-muted text-center text-sm">
            または、テキストでリクエスト内容を入力してください
          </p>

          <input
            type="text"
            value={newMenu}
            onChange={(e) => setNewMenu(e.target.value)}
            className="luxury-input"
            placeholder="例: カレーライス"
          />

          <button
            type="submit"
            className="luxury-btn luxury-btn-primary w-full sm:w-auto mx-auto block"
          >
            リクエストを送信
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-muted mb-6">{message}</p>
        )}

        {/* ─── メニュー一覧 ─── */}
        <div className="divider-accent"></div>

        <h2 className="luxury-title text-2xl">リクエストされたメニュー</h2>

        <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
          {menuList.map((m) => (
            <div
              key={m.id}
              className="luxury-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <Link href={`/menus/${m.id}`} className="flex-1 min-w-0">
                <div className="cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-lg font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {m.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleGood(m.id);
                      }}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      {goodStatus[m.id]?.exists ? (
                        <span className="text-2xl">❤️</span>
                      ) : (
                        <span className="text-2xl opacity-40 hover:opacity-70 transition-opacity">
                          🤍
                        </span>
                      )}
                    </button>
                    <span className="text-sm text-muted font-medium">
                      {goodCount[m.id] ?? 0}
                    </span>
                  </div>
                  {m.member && (
                    <div className="text-sm text-muted">
                      提案者: {m.member.name}
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  className="luxury-btn luxury-btn-primary text-sm px-4 py-2"
                  onClick={() => handleFetchSuggestions(m.name)}
                >
                  提案を取得
                </button>

                <button
                  className="luxury-btn luxury-btn-outline text-sm px-4 py-2"
                  onClick={() => {
                    setEditingId(m.id);
                    setEditingValue(m.name);
                    setShowEditModal(true);
                  }}
                >
                  編集
                </button>

                <button
                  className="px-4 py-2 text-sm bg-[var(--terracotta-100)] text-[var(--terracotta-600)] rounded-full hover:bg-[var(--terracotta-200)] transition-colors font-medium"
                  onClick={async () => {
                    if (!confirm("本当に削除しますか？")) return;
                    try {
                      await apiClient.delete(`/api/menus/${m.id}`);
                      setMenuList((prev) =>
                        prev.filter((it) => it.id !== m.id),
                      );
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
          {suggestionError && (
            <p className="text-sm text-[var(--secondary)] text-center">
              {suggestionError}
            </p>
          )}
        </div>

        {/* 編集モーダル */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="luxury-card max-w-md w-full animate-scale-in">
              <h2 className="luxury-label text-center mb-6">メニューを編集</h2>
              <input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="luxury-input mb-6"
              />
              <div className="flex justify-end gap-3">
                <button
                  className="luxury-btn luxury-btn-ghost"
                  onClick={() => setShowEditModal(false)}
                >
                  キャンセル
                </button>
                <button
                  className="luxury-btn luxury-btn-primary"
                  onClick={async () => {
                    try {
                      await apiClient.patch(`/api/menus/${editingId}`, {
                        menu: { name: editingValue },
                      });
                      setMenuList((prev) =>
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

        {loading && <LoadingSpinner />}

        <div ref={suggestionsRef}>
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
    </div>
  );
}
