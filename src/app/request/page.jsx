"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AuthHeader } from "@/components/auth_header";
import { useRouter } from "next/navigation";
import { handleEmailSignIn } from "@/app/lib/email-signin";
import { isSignInWithEmailLink } from "firebase/auth";

export default function RequestPage() {
  const router = useRouter();
  const menuListRef = useRef(null);

  // ── 作成フォーム用 state ──
  const [newMenu, setNewMenu] = useState("");
  const [message, setMessage] = useState("");
  const [likes, setLikes] = useState([]);

  // ── 一覧用 state ──
  const [menuList, setMenuList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [goodStatus, setGoodStatus] = useState({});
  const [goodCount, setGoodCount] = useState({});

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

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.replace("/login");
        }
      });
    };

    runEmailSignIn();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  // ── データ読み込み（likes + menus + good） ──
  useEffect(() => {
    if (!auth.currentUser) return;

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
              /* eslint-disable-next-line camelcase */
              params: { menu_id: m.id },
            });
            goodStatusMap[m.id] = {
              exists: goodRes.data.exists,
              /* eslint-disable-next-line camelcase */
              good_id: goodRes.data.good?.id || null,
            };
          } catch (err) {
            console.error(`good チェック失敗 (menu_id: ${m.id}):`, err);
            /* eslint-disable-next-line camelcase */
            goodStatusMap[m.id] = { exists: false, good_id: null };
          }

          try {
            const countRes = await apiClient.get("/api/goods/count", {
              /* eslint-disable-next-line camelcase */
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
  }, []);

  // ── メニュー作成 ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
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
      // メニューリストへ自動スクロール
      setTimeout(() => {
        if (menuListRef.current) {
          menuListRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 100);
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
          /* eslint-disable-next-line camelcase */
          [menuId]: { exists: false, good_id: null },
        }));
        setGoodCount((prev) => ({
          ...prev,
          [menuId]: Math.max((prev[menuId] || 0) - 1, 0),
        }));
      } else {
        const res = await apiClient.post("/api/goods", {
          /* eslint-disable-next-line camelcase */
          good: { menu_id: menuId },
        });
        setGoodStatus((prev) => ({
          ...prev,
          /* eslint-disable-next-line camelcase */
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
          {menuList.map((m, index) => (
            <div
              key={m.id}
              ref={index === menuList.length - 1 ? menuListRef : null}
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
      </div>
    </div>
  );
}
