"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { AuthHeader } from "../../../components/auth_header";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

export default function FamilySuggestionPage() {
  const [usertoken, setUsertoken] = useState("");
  const [recipeList, setRecipeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── メニュー選択用 ──
  const [menuList, setMenuList] = useState([]);
  const [goodCount, setGoodCount] = useState({});
  const [selectedMenuId, setSelectedMenuId] = useState("");

  // ── 各献立ごとの人数管理 ──
  const [servingsMap, setServingsMap] = useState({});

  // ── 過去献立のレシピアコーディオン管理 ──
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [recipeDetailMap, setRecipeDetailMap] = useState({});
  const [recipeDetailLoading, setRecipeDetailLoading] = useState({});

  // ── レシピ説明用 ──
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeData, setRecipeData] = useState(null);
  const [currentRecipeId, setCurrentRecipeId] = useState(null);

  // ── 料理担当者関連 state ──
  const [members, setMembers] = useState([]);
  const [todayCookId, setTodayCookId] = useState(null);
  const [cookSelectMessage, setCookSelectMessage] = useState("");

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

  // ── メニュー一覧 + good count 取得 ──
  useEffect(() => {
    if (!auth.currentUser) return;
    const loadMenus = async () => {
      try {
        const res = await apiClient.get("/api/menus");
        const menus = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];
        setMenuList(menus);

        const goodCountMap = {};
        for (const m of menus) {
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
        setGoodCount(goodCountMap);
      } catch (error) {
        console.error("メニューの取得に失敗しました:", error);
      }
    };
    loadMenus();
  }, []);

  // ── メンバー一覧とファミリー情報取得 ──
  useEffect(() => {
    if (!auth.currentUser) return;

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
  }, []);

  // ── 過去の献立取得 → Recipeモデルへ登録 → Recipeモデルから一覧取得 ──
  const fetchPastSuggestions = async () => {
    setLoading(true);
    try {
      const recipeRes = await apiClient.get("/api/recipes/family");
      setRecipeList(Array.isArray(recipeRes.data) ? recipeRes.data : []);
    } catch (error) {
      console.error("家族の献立取得に失敗しました:", error);
      setRecipeList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usertoken) return;
    fetchPastSuggestions();
  }, [usertoken]);

  // ── レシピ説明リクエスト ──
  const handleFetchRecipe = async (
    dishName,
    numServings = 4,
    recipeId = null,
  ) => {
    if (!dishName) {
      alert("料理するメニューを選んでください");
      return;
    }

    setRecipeLoading(true);
    setShowRecipeModal(true);
    setRecipeData(null);
    setCurrentRecipeId(recipeId);

    try {
      const response = await apiClient.post("/api/recipes/explain", {
        /* eslint-disable-next-line camelcase */
        dish_name: dishName,
        servings: Number(numServings),
      });

      setRecipeData(response.data?.recipe);
    } catch (error) {
      console.error("レシピ説明取得失敗:", error);
      alert("レシピ説明の取得に失敗しました");
      setShowRecipeModal(false);
    } finally {
      setRecipeLoading(false);
    }
  };

  // ── レシピを過去の献立に追加 ──
  const handleSaveRecipe = async (recipeId) => {
    if (!recipeData) return;

    try {
      // バックエンドに保存（手順を含める）
      /* eslint-disable camelcase */
      await apiClient.post(`/api/recipe/${recipeId}`, {
        servings: recipeData.servings,
        missing_ingredients: recipeData.missing_ingredients,
        cooking_time: recipeData.cooking_time,
        steps: recipeData.steps,
      });
      /* eslint-enable camelcase */

      alert("献立に追加しました！");
      setShowRecipeModal(false);
      setSelectedMenuId("");
      // 過去の献立一覧をリロード
      await fetchPastSuggestions();
    } catch (error) {
      console.error("献立保存失敗:", error);
      alert("献立の保存に失敗しました");
    }
  };

  // ── レシピ削除 ──
  const handleDeleteRecipe = async (recipeId, dishName) => {
    if (!confirm(`「${dishName}」を献立一覧から削除しますか？`)) return;
    try {
      await apiClient.delete(`/api/recipes/${recipeId}`);
      setRecipeList((prev) => prev.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error("レシピ削除失敗:", error);
      alert("削除に失敗しました");
    }
  };

  // ── 料理担当者選択 ──
  const handleSelectCook = async (memberId) => {
    try {
      setCookSelectMessage("");
      await apiClient.post("/api/families/assign_cook", {
        /* eslint-disable-next-line camelcase */
        member_id: memberId,
      });
      setTodayCookId(memberId);
      setCookSelectMessage(
        "料理担当者を設定しました（献立の追加は担当者のみ可能です）",
      );
      setTimeout(() => setCookSelectMessage(""), 3000);
    } catch (error) {
      console.error("料理担当者設定失敗:", error);
      setCookSelectMessage("料理担当者の設定に失敗しました");
    }
  };

  // ── 過去献立のレシピ詳細を取得（アコーディオン展開時） ──
  const handleToggleRecipeDetail = async (suggestionId, recipeId) => {
    if (expandedRecipeId === suggestionId) {
      setExpandedRecipeId(null);
      return;
    }
    setExpandedRecipeId(suggestionId);
    if (recipeDetailMap[suggestionId] !== undefined) return;
    if (!recipeId) {
      setRecipeDetailMap((prev) => ({ ...prev, [suggestionId]: null }));
      return;
    }
    setRecipeDetailLoading((prev) => ({ ...prev, [suggestionId]: true }));
    try {
      const res = await apiClient.get(`/api/recipes/${recipeId}`);
      setRecipeDetailMap((prev) => ({ ...prev, [suggestionId]: res.data }));
    } catch (error) {
      console.error("レシピ詳細取得失敗:", error);
      setRecipeDetailMap((prev) => ({ ...prev, [suggestionId]: null }));
    } finally {
      setRecipeDetailLoading((prev) => ({ ...prev, [suggestionId]: false }));
    }
  };

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1
            className="text-2xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🏠 わが家の献立
          </h1>
          <p className="text-sm text-muted text-center max-w-lg">
            料理するメニューを選択して、AIに作り方を提案してもらいましょう。
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/menus/familysuggestion/suggestion"
              className="luxury-btn luxury-btn-outline flex items-center gap-2"
            >
              <span>🌍</span>
              <span>みんなの献立を参考にする</span>
            </Link>
            <Link
              href="/menus"
              className="luxury-btn luxury-btn-secondary flex items-center gap-2"
            >
              <span>🍽️</span>
              <span>メニュー提案ページへ戻る</span>
            </Link>
          </div>
        </div>

        {/* ────── メニュー選択 → 過去の献立に加える ────── */}
        <div className="luxury-card max-w-2xl mx-auto mb-8">
          <label className="luxury-label text-center block mb-4">
            【家族からのリクエストを献立一覧に加える】
          </label>
          <div className="space-y-4">
            {/* ─── 料理担当者選択 ─── */}
            <div>
              <label className="luxury-label text-sm block mb-2">
                きょうの料理担当者
              </label>
              <select
                value={todayCookId || ""}
                onChange={(e) => handleSelectCook(Number(e.target.value))}
                className="luxury-select"
              >
                <option value="">─── 料理担当者を選択 ───</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {todayCookId === member.id ? " ✓" : ""}
                  </option>
                ))}
              </select>
              {cookSelectMessage && (
                <p className="text-sm mt-2 text-[var(--sage-600)]">
                  {cookSelectMessage}
                </p>
              )}
            </div>

            {/* ─── メニュー選択 ─── */}
            {/* ─── メニュー選択 ─── */}
            <div>
              <label className="luxury-label text-sm block mb-2">
                家族からのリクエストを選択
              </label>
              <select
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                className="luxury-select"
              >
                <option value="">─── 家族からのリクエストを選択 ───</option>
                {menuList.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}（提案者: {menu.member?.name || "不明"}）❤️
                    {goodCount[menu.id] || 0}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={async () => {
                if (!selectedMenuId) {
                  alert("メニューを選んでください");
                  return;
                }
                // ── 料理担当者チェック ──
                if (!todayCookId) {
                  alert(
                    "料理担当者が設定されていません。上のドロップダウンから料理担当者を設定してください。",
                  );
                  return;
                }
                const id = Number(selectedMenuId);
                if (Number.isNaN(id)) return;
                const selectedMenu = menuList.find((m) => m.id === id);
                if (!selectedMenu) return;
                try {
                  const proposerName = selectedMenu.member?.name || "不明";
                  await apiClient.post("/api/recipe/save_recipe", {
                    /* eslint-disable-next-line camelcase */
                    dish_name: selectedMenu.name,
                    proposer: selectedMenu.member?.id,
                    reason: `${proposerName}が提案した料理です`,
                  });
                  alert("過去の献立一覧に追加しました！");
                  setSelectedMenuId("");
                  await fetchPastSuggestions();
                } catch (error) {
                  console.error("献立追加失敗:", error);
                  alert("献立の追加に失敗しました");
                }
              }}
              className="luxury-btn luxury-btn-primary w-full"
            >
              献立一覧に加える
            </button>
          </div>
          <p className="text-sm text-muted text-center mt-4">
            リクエストの編集・削除は
            <Link href="/request" className="text-[var(--primary)] underline">
              リクエスト管理ページ
            </Link>
            で行えます。
          </p>
        </div>

        {/* ────── レシピ説明モーダル ────── */}
        {showRecipeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {recipeLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner />
                  <p className="text-sm text-muted mt-4">レシピを取得中...</p>
                </div>
              ) : recipeData ? (
                <div className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    {recipeData.dish_name}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted">人数：</span>
                      <span className="font-medium">
                        {recipeData.servings}人分
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">調理時間：</span>
                      <span className="font-medium">
                        {recipeData.cooking_time}分
                      </span>
                    </div>
                  </div>

                  {recipeData.missing_ingredients &&
                    recipeData.missing_ingredients.length > 0 && (
                      <div>
                        <h3 className="font-bold text-[var(--foreground)] mb-2">
                          不足食材
                        </h3>
                        <ul className="space-y-1 text-sm text-muted">
                          {recipeData.missing_ingredients.map((ing, idx) => (
                            <li key={idx}>
                              • {ing.name}：{ing.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {recipeData.steps && (
                    <div>
                      <h3 className="font-bold text-[var(--foreground)] mb-2">
                        調理手順
                      </h3>
                      <ol className="space-y-2 text-sm text-muted list-decimal list-inside">
                        {recipeData.steps.map((step) => (
                          <li key={step.step}>{step.description}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowRecipeModal(false)}
                      className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--card-bg)]"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => handleSaveRecipe(currentRecipeId)}
                      className="flex-1 luxury-btn luxury-btn-primary"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-red-500">レシピの取得に失敗しました</p>
                  <button
                    onClick={() => setShowRecipeModal(false)}
                    className="mt-4 luxury-btn luxury-btn-primary"
                  >
                    閉じる
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 採用された献立一覧 ─── */}
        <h2
          className="text-xl font-medium text-[var(--foreground)] text-center mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          📜 採用された献立
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : recipeList.length === 0 ? (
          <div className="luxury-card max-w-xl mx-auto text-center py-8 mb-12">
            <p className="text-muted text-lg">まだ採用された献立がありません</p>
            <p className="text-sm text-muted mt-2">
              上のボタンから家族からのリクエストを「献立一覧に加える」とここに表示されます。
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-4 mb-12">
            {recipeList.map((r) => {
              const dishTitle = r.dish_name || "タイトルなし";
              const dishReason = r.reason || "";
              const currentServings = servingsMap[r.id] || "4";
              const isExpanded = expandedRecipeId === r.id;
              const recipeDetail = recipeDetailMap[r.id];
              const isDetailLoading = recipeDetailLoading[r.id];
              return (
                <div key={r.id} className="luxury-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        🍽️ {dishTitle}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted whitespace-nowrap">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString("ja-JP")
                          : ""}
                      </span>
                      <button
                        onClick={() => handleDeleteRecipe(r.id, dishTitle)}
                        className="text-muted hover:text-red-500 transition-colors text-sm px-1"
                        title="この献立を削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted me-3">💡 {dishReason}</p>
                  <div className="flex flex-col gap-3 mt-4">
                    <select
                      value={currentServings}
                      onChange={(e) =>
                        setServingsMap((prev) => ({
                          ...prev,
                          [r.id]: e.target.value,
                        }))
                      }
                      className="luxury-select text-sm w-full"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}人分
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        handleFetchRecipe(dishTitle, currentServings, r.id)
                      }
                      className="luxury-btn luxury-btn-primary w-full text-sm"
                    >
                      このメニューの作り方をAIに提案してもらう
                    </button>
                  </div>

                  {/* ── レシピ詳細アコーディオン ── */}
                  <div className="mt-3 border-t border-[var(--border)] pt-3">
                    <button
                      onClick={() => handleToggleRecipeDetail(r.id, r.id)}
                      className="flex items-center justify-between w-full text-sm font-medium text-[var(--primary)] hover:opacity-80 transition-opacity"
                    >
                      <span>
                        📖 保存済みレシピを{isExpanded ? "閉じる" : "見る"}
                      </span>
                      <span
                        className="transition-transform duration-200"
                        style={{
                          display: "inline-block",
                          transform: isExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      >
                        ▼
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-3">
                        {isDetailLoading ? (
                          <div className="py-4 text-center">
                            <LoadingSpinner />
                          </div>
                        ) : recipeDetail &&
                          (recipeDetail.steps ||
                            recipeDetail.servings ||
                            recipeDetail.cooking_time) ? (
                          <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-muted">人数：</span>
                                <span className="font-medium">
                                  {recipeDetail.servings}人分
                                </span>
                              </div>
                              <div>
                                <span className="text-muted">調理時間：</span>
                                <span className="font-medium">
                                  {recipeDetail.cooking_time}分
                                </span>
                              </div>
                            </div>
                            {recipeDetail.missing_ingredients &&
                              recipeDetail.missing_ingredients.length > 0 && (
                                <div>
                                  <p className="font-medium text-[var(--foreground)] mb-1">
                                    🛒 不足食材
                                  </p>
                                  <ul className="space-y-1 text-muted">
                                    {recipeDetail.missing_ingredients.map(
                                      (ing, idx) => (
                                        <li key={idx}>
                                          • {ing.name}：{ing.quantity}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                            {recipeDetail.steps && (
                              <div>
                                <p className="font-medium text-[var(--foreground)] mb-1">
                                  📝 調理手順
                                </p>
                                <ol className="space-y-1 text-muted list-decimal list-inside">
                                  {recipeDetail.steps.map((step) => (
                                    <li key={step.step}>{step.description}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted py-2">
                            保存済みレシピがありません。上のボタンからAIに提案してもらいましょう。
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-4 mb-12 justify-center">
          <Link href="/menus" className="luxury-btn luxury-btn-secondary">
            メニュー提案ページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
