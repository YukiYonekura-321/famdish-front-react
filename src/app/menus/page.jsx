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
    <div className="gra-page p-8 flex flex-col items-center">
      <AuthHeader />

      <div className="w-full flex flex-col items-center gap-6 mt-12">
        {/* ─── 料理担当者選択 ─── */}
        <div className="gra-card w-full max-w-xl flex flex-col items-center space-y-4">
          <label className="font-bold text-2xl">今日の料理担当者</label>
          <select
            value={todayCookId || ""}
            onChange={(e) => handleSelectCook(Number(e.target.value) || null)}
            className="gra-input w-full"
          >
            <option value="">選択してください</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {cookSelectMessage && (
            <p className="text-sm text-green-600">{cookSelectMessage}</p>
          )}
        </div>

        {/* ─── リクエスト作成フォーム ─── */}
        <h1 className="gra-title">食べたいものをリクエストしよう！</h1>

        <form
          onSubmit={handleSubmit}
          className="gra-card w-full max-w-xl flex flex-col items-center space-y-6"
        >
          <label className="font-bold text-2xl">リクエスト内容</label>

          <select
            value={newMenu}
            onChange={(e) => setNewMenu(e.target.value)}
            className="gra-input w-full"
          >
            <option value="">選択してください</option>
            {likes.map((like) => (
              <option key={like.id} value={like.name}>
                {like.name}
              </option>
            ))}
          </select>

          <p className="font-bold text-lg small-note">
            または、テキストでリクエスト内容を入力してください。
          </p>
          <input
            type="text"
            value={newMenu}
            onChange={(e) => setNewMenu(e.target.value)}
            className="gra-input w-full"
          />
          <button type="submit" className="gra-btn w-40 mx-auto">
            送信
          </button>
        </form>

        {message && <p className="mt-4 small-note">{message}</p>}

        {/* ─── メニュー一覧 ─── */}
        <h2 className="text-2xl font-bold gra-title mt-12">
          リクエストされたメニュー(一覧)
        </h2>

        <div className="w-full flex flex-col items-center gap-4 mt-6">
          {menuList.map((m) => (
            <div
              key={m.id}
              className="w-11/12 sm:w-3/4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <Link href={`/menus/${m.id}`} className="w-full sm:w-auto">
                <div className="gra-card w-full cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>{m.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleGood(m.id);
                      }}
                      className="focus:outline-none"
                    >
                      {goodStatus[m.id]?.exists ? (
                        <span className="text-2xl text-pink-500">❤️</span>
                      ) : (
                        <span className="text-2xl text-gray-400">🤍</span>
                      )}
                    </button>
                    <span className="text-sm text-gray-600">
                      {goodCount[m.id] ?? 0}
                    </span>
                  </div>
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
                  onClick={() => handleFetchSuggestions(m.name)}
                >
                  提案を取得する
                </button>
                {suggestionError && (
                  <p className="text-sm text-red-600">{suggestionError}</p>
                )}

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
