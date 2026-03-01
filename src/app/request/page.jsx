"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, isSignInWithEmailLink } from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { apiClient } from "@/shared/lib/api";
import { AuthHeader } from "@/shared/components/auth_header";
import { handleEmailSignIn } from "@/features/auth/lib/email-signin";

export default function RequestPage() {
  const router = useRouter();
  const menuListRef = useRef(null);

  // ── フォーム state ──
  const [newMenu, setNewMenu] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [likes, setLikes] = useState([]);

  // ── 一覧 state ──
  const [menuList, setMenuList] = useState([]);
  const [goodStatus, setGoodStatus] = useState({});
  const [goodCount, setGoodCount] = useState({});

  // ── 編集モーダル state ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [editError, setEditError] = useState("");

  // ── 削除確認 state ──
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // ── 認証 ──
  useEffect(() => {
    let unsubscribe;

    const runEmailSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          await handleEmailSignIn();
        } catch (error) {
          console.error("Email sign in failed:", error);
        }
        return;
      }

      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) router.replace("/login");
      });
    };

    runEmailSignIn();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  // ── メニュー読み込み ──
  const loadMenus = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/menus");
      const menus = Array.isArray(res.data)
        ? res.data
        : res.data
          ? [res.data]
          : [];
      setMenuList(menus);

      const statusMap = {};
      const countMap = {};
      await Promise.all(
        menus.map(async (m) => {
          try {
            const goodRes = await apiClient.get("/api/goods/check", {
              // eslint-disable-next-line camelcase
              params: { menu_id: m.id },
            });
            statusMap[m.id] = {
              exists: goodRes.data.exists,
              // eslint-disable-next-line camelcase
              good_id: goodRes.data.good?.id ?? null,
            };
          } catch {
            // eslint-disable-next-line camelcase
            statusMap[m.id] = { exists: false, good_id: null };
          }
          try {
            const countRes = await apiClient.get("/api/goods/count", {
              // eslint-disable-next-line camelcase
              params: { menu_id: m.id },
            });
            countMap[m.id] = Number(countRes.data.count) || 0;
          } catch {
            countMap[m.id] = 0;
          }
        }),
      );
      setGoodStatus(statusMap);
      setGoodCount(countMap);
    } catch (error) {
      console.error("メニューの取得に失敗しました:", error);
    }
  }, []);

  // ── 初期データ読み込み ──
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchLikes = async () => {
      try {
        const res = await apiClient.get("/api/likes");
        setLikes(res.data || []);
      } catch {
        setLikes([]);
      }
    };

    fetchLikes();
    loadMenus();
  }, [loadMenus]);

  // ── メニュー作成 ──
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage("");
      setIsError(false);

      try {
        await apiClient.post("/api/menus", { menu: { name: newMenu } });
        setMessage("リクエストを送信しました！");
        setNewMenu("");
        await loadMenus();
        setTimeout(() => {
          menuListRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 100);
      } catch (error) {
        setIsError(true);
        if (error.response) {
          const errors = error.response.data.errors || [
            "不明なエラーが発生しました",
          ];
          setMessage("リクエストに失敗しました:\n" + errors.join("\n"));
        } else {
          setMessage("リクエストに失敗しました: ネットワークエラー");
        }
      }
    },
    [newMenu, loadMenus],
  );

  // ── ハート（good）トグル ──
  const handleToggleGood = useCallback(
    async (menuId) => {
      try {
        if (goodStatus[menuId]?.exists) {
          await apiClient.delete(`/api/goods/${goodStatus[menuId].good_id}`);
          setGoodStatus((prev) => ({
            ...prev,
            // eslint-disable-next-line camelcase
            [menuId]: { exists: false, good_id: null },
          }));
          setGoodCount((prev) => ({
            ...prev,
            [menuId]: Math.max((prev[menuId] || 0) - 1, 0),
          }));
        } else {
          const res = await apiClient.post("/api/goods", {
            // eslint-disable-next-line camelcase
            good: { menu_id: menuId },
          });
          setGoodStatus((prev) => ({
            ...prev,
            // eslint-disable-next-line camelcase
            [menuId]: { exists: true, good_id: res.data.id },
          }));
          setGoodCount((prev) => ({
            ...prev,
            [menuId]: (prev[menuId] || 0) + 1,
          }));
        }
      } catch (err) {
        console.error("good トグル失敗:", err);
      }
    },
    [goodStatus],
  );

  // ── 削除 ──
  const handleDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/api/menus/${deleteTargetId}`);
      setMenuList((prev) => prev.filter((it) => it.id !== deleteTargetId));
    } catch (err) {
      console.error("削除に失敗しました", err);
    } finally {
      setDeleteTargetId(null);
    }
  }, [deleteTargetId]);

  // ── 編集保存 ──
  const handleEditSave = useCallback(async () => {
    setEditError("");
    try {
      await apiClient.patch(`/api/menus/${editingId}`, {
        menu: { name: editingValue },
      });
      setMenuList((prev) =>
        prev.map((it) =>
          it.id === editingId ? { ...it, name: editingValue } : it,
        ),
      );
      setShowEditModal(false);
    } catch (err) {
      console.error("更新に失敗しました", err);
      setEditError("更新に失敗しました。再度お試しください。");
    }
  }, [editingId, editingValue]);

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8">
        {/* ────── リクエスト作成フォーム ────── */}
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
            disabled={!newMenu.trim()}
            className="luxury-btn luxury-btn-primary w-full sm:w-auto mx-auto block
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            リクエストを送信
          </button>
        </form>

        {message && (
          <p
            className={`text-center text-sm mb-6 whitespace-pre-line ${isError ? "text-red-600" : "text-muted"}`}
          >
            {message}
          </p>
        )}

        {/* ─── メニュー一覧 ─── */}
        <div className="divider-accent" />

        <h2 className="luxury-title text-2xl">リクエストされたメニュー</h2>

        <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
          {menuList.map((m, index) => (
            <div
              key={m.id}
              ref={index === menuList.length - 1 ? menuListRef : null}
              className="luxury-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-lg font-medium text-[var(--foreground)]"
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

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  className="luxury-btn luxury-btn-outline text-sm px-4 py-2"
                  onClick={() => {
                    setEditingId(m.id);
                    setEditingValue(m.name);
                    setEditError("");
                    setShowEditModal(true);
                  }}
                >
                  編集
                </button>

                <button
                  className="px-4 py-2 text-sm bg-[var(--terracotta-100)] text-[var(--terracotta-600)] rounded-full hover:bg-[var(--terracotta-200)] transition-colors font-medium"
                  onClick={() => setDeleteTargetId(m.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ─── 削除確認モーダル ─── */}
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="luxury-card max-w-sm w-full space-y-4">
              <p className="text-center text-[var(--foreground)] font-medium">
                本当に削除しますか？
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="luxury-btn luxury-btn-ghost"
                  onClick={() => setDeleteTargetId(null)}
                >
                  キャンセル
                </button>
                <button
                  className="px-4 py-2 text-sm font-semibold text-white bg-[var(--terracotta-500)] hover:bg-[var(--terracotta-600)] rounded-xl transition-colors"
                  onClick={handleDelete}
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── 編集モーダル ─── */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="luxury-card max-w-md w-full animate-scale-in">
              <h2 className="luxury-label text-center mb-6">メニューを編集</h2>
              <input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="luxury-input mb-2"
              />
              {editError && (
                <p className="text-sm text-red-600 mb-4">{editError}</p>
              )}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="luxury-btn luxury-btn-ghost"
                  onClick={() => setShowEditModal(false)}
                >
                  キャンセル
                </button>
                <button
                  className="luxury-btn luxury-btn-primary"
                  disabled={!editingValue.trim()}
                  onClick={handleEditSave}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── ナビゲーションリンク ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            href="/menus"
            className="luxury-btn luxury-btn-secondary flex items-center gap-2"
          >
            <span>🤖</span>
            <span>メニュー提案ページへ移動</span>
          </Link>
          <Link
            href="/menus/familysuggestion"
            className="luxury-btn luxury-btn-outline flex items-center gap-2"
          >
            <span>🏠</span>
            <span>我が家の献立ページへ戻る</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
