"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import { AuthHeader } from "../../../components/auth_header";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

export default function FamilySuggestionPage() {
  const [usertoken, setUsertoken] = useState("");
  const [pastSuggestions, setPastSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── メニュー選択用 ──
  const [menuList, setMenuList] = useState([]);
  const [goodCount, setGoodCount] = useState({});
  const [selectedMenuId, setSelectedMenuId] = useState("");

  // ── 制約条件 ──
  const [servings, setServings] = useState("4");

  // ── レシピ説明用 ──
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeData, setRecipeData] = useState(null);
  const aiSuggestionsRef = useRef(null);

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

  // ── 過去の献立取得 ──
  const fetchPastSuggestions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/suggestions/check");
      setPastSuggestions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("家族の献立取得に失敗しました:", error);
      setPastSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usertoken) return;
    fetchPastSuggestions();
  }, [usertoken]);

  // ── レシピ説明リクエスト ──
  const handleFetchRecipe = async (dishName) => {
    if (!dishName) {
      alert("料理するメニューを選んでください");
      return;
    }

    setRecipeLoading(true);
    setShowRecipeModal(true);
    setRecipeData(null);

    try {
      const response = await apiClient.post("/api/recipes/explain", {
        dish_name: dishName,
        servings: Number(servings),
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
  const handleSaveRecipe = async () => {
    if (!recipeData) return;

    try {
      // バックエンドに保存（手順を含める）
      await apiClient.post("/api/menus/save_recipe", {
        dish_name: recipeData.dish_name,
        servings: recipeData.servings,
        missing_ingredients: recipeData.missing_ingredients,
        cooking_time: recipeData.cooking_time,
        steps: recipeData.steps,
      });

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

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1
            className="text-2xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🏠 わが家の過去の献立
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
              <span>メニューページへ戻る</span>
            </Link>
          </div>
        </div>

        {/* ────── メニュー選択 ────── */}
        <div className="luxury-card max-w-2xl mx-auto mb-8">
          <label className="luxury-label text-center block mb-4">
            【料理するメニューを選択】
          </label>
          <div className="space-y-4">
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="luxury-select"
            >
              <option value="">─── メニューを選択 ───</option>
              {menuList.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name} ❤️{goodCount[menu.id] || 0}
                </option>
              ))}
            </select>

            <div className="space-y-2">
              <label className="luxury-label text-sm block">何人分</label>
              <select
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="luxury-select text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}人分
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (selectedMenuId) {
                  const id = Number(selectedMenuId);
                  if (!Number.isNaN(id)) {
                    const selectedMenu = menuList.find((m) => m.id === id);
                    if (selectedMenu) {
                      handleFetchRecipe(selectedMenu.name);
                    }
                  }
                } else {
                  alert("料理するメニューを選んでください");
                }
              }}
              className="luxury-btn luxury-btn-primary w-full"
            >
              このメニューの作り方をAIに提案してもらう
            </button>
          </div>
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
                      onClick={handleSaveRecipe}
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

        {/* ─── 過去の献立一覧 ─── */}
        <h2
          className="text-xl font-medium text-[var(--foreground)] text-center mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          📜 過去に採用された献立
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : pastSuggestions.length === 0 ? (
          <div className="luxury-card max-w-xl mx-auto text-center py-8 mb-12">
            <p className="text-muted text-lg">まだ採用された献立がありません</p>
            <p className="text-sm text-muted mt-2">
              上のボタンからAI提案を受けて、「保存」を押すとここに表示されます。
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-4 mb-12">
            {pastSuggestions.map((s) => (
              <div key={s.id} className="luxury-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">
                      🍽️ {s.ai_raw_json?.title || "タイトルなし"}
                    </h3>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                {s.ai_raw_json?.reason && (
                  <p className="text-sm text-muted mt-3">
                    💡 {s.ai_raw_json.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 mb-12 justify-center">
          <Link href="/menus" className="luxury-btn luxury-btn-secondary">
            メニューページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
