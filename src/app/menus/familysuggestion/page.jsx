"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/api";
import { auth } from "@/app/lib/firebase";
import { AuthHeader } from "@/components/auth_header";
import LoadingSpinner from "@/components/LoadingSpinner";

// ── 定数 ──

const SERVINGS_OPTIONS = [1, 2, 3, 4, 5, 6];

const NAV_LINKS = [
  {
    href: "/menus/familysuggestion/suggestion",
    icon: "🌍",
    label: "みんなの献立を参考にする",
    variant: "outline",
  },
  {
    href: "/menus",
    icon: "🍽️",
    label: "メニュー提案ページへ戻る",
    variant: "secondary",
  },
];

// ── サブコンポーネント ──

/** 不足食材リスト（モーダル・アコーディオン共通） */
function MissingIngredients({ items, heading = "不足食材" }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="font-bold text-[var(--foreground)] mb-2">{heading}</h3>
      <ul className="space-y-1 text-sm text-muted">
        {items.map((ing, idx) => (
          <li key={idx}>
            • {ing.name}：{ing.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 調理手順リスト（モーダル・アコーディオン共通） */
function StepsList({ steps, heading = "調理手順" }) {
  if (!steps?.length) return null;
  return (
    <div>
      <h3 className="font-bold text-[var(--foreground)] mb-2">{heading}</h3>
      <ol className="space-y-2 text-sm text-muted list-decimal list-inside">
        {steps.map((step) => (
          <li key={step.step}>{step.description}</li>
        ))}
      </ol>
    </div>
  );
}

/** レシピ説明モーダル */
function RecipeModal({ show, loading: isLoading, data, onClose, onSave }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
            <p className="text-sm text-muted mt-4">レシピを取得中...</p>
          </div>
        ) : data ? (
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              {data.dish_name}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted">人数：</span>
                <span className="font-medium">{data.servings}人分</span>
              </div>
              <div>
                <span className="text-muted">調理時間：</span>
                <span className="font-medium">{data.cooking_time}分</span>
              </div>
            </div>
            <MissingIngredients items={data.missing_ingredients} />
            <StepsList steps={data.steps} />
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--card-bg)]"
              >
                キャンセル
              </button>
              <button
                onClick={onSave}
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
              onClick={onClose}
              className="mt-4 luxury-btn luxury-btn-primary"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** レシピ詳細アコーディオン */
function RecipeAccordion({ isExpanded, isLoading, detail, onToggle }) {
  return (
    <div className="mt-3 border-t border-[var(--border)] pt-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-medium text-[var(--primary)] hover:opacity-80 transition-opacity"
      >
        <span>📖 保存済みレシピを{isExpanded ? "閉じる" : "見る"}</span>
        <span
          className="transition-transform duration-200"
          style={{
            display: "inline-block",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3">
          {isLoading ? (
            <div className="py-4 text-center">
              <LoadingSpinner />
            </div>
          ) : detail &&
            (detail.steps || detail.servings || detail.cooking_time) ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted">人数：</span>
                  <span className="font-medium">{detail.servings}人分</span>
                </div>
                <div>
                  <span className="text-muted">調理時間：</span>
                  <span className="font-medium">{detail.cooking_time}分</span>
                </div>
              </div>
              <MissingIngredients
                items={detail.missing_ingredients}
                heading="🛒 不足食材"
              />
              {detail.steps && (
                <div>
                  <p className="font-medium text-[var(--foreground)] mb-1">
                    📝 調理手順
                  </p>
                  <ol className="space-y-1 text-muted list-decimal list-inside">
                    {detail.steps.map((step) => (
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
  );
}

/** 献立カード1枚分 */
function RecipeCard({
  recipe,
  members,
  myMemberId,
  servings,
  onServingsChange,
  onFetchRecipe,
  onDelete,
  expandedRecipeId,
  recipeDetailMap,
  recipeDetailLoading,
  onToggleDetail,
}) {
  const dishTitle = recipe.dish_name || "タイトルなし";
  const isCook =
    !recipe.proposer_id || !myMemberId || recipe.proposer_id === myMemberId;

  const handleAiClick = () => {
    if (!isCook) {
      const cookName =
        members.find((m) => m.id === recipe.proposer_id)?.name || "担当者";
      alert(`この操作は調理者（${cookName}）のみ実行できます。`);
      return;
    }
    onFetchRecipe(dishTitle, servings, recipe.id);
  };

  return (
    <div className="luxury-card">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="flex-1 text-lg font-bold text-[var(--foreground)]">
          🍽️ {dishTitle}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted whitespace-nowrap">
            {recipe.created_at
              ? new Date(recipe.created_at).toLocaleDateString("ja-JP")
              : ""}
          </span>
          <button
            onClick={() => onDelete(recipe.id, dishTitle)}
            className="text-muted hover:text-red-500 transition-colors text-sm px-1"
            title="この献立を削除"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* メタ情報 */}
      <p className="text-sm text-muted me-3">💡 {recipe.reason || ""}</p>
      <p className="text-sm text-muted me-3">
        👨‍🍳 調理者:{" "}
        {recipe.proposer_id
          ? members.find((m) => m.id === recipe.proposer_id)?.name || "不明"
          : "未設定"}
      </p>

      {/* 操作 */}
      <div className="flex flex-col gap-3 mt-4">
        <select
          value={servings}
          onChange={(e) => onServingsChange(e.target.value)}
          className="luxury-select text-sm w-full"
        >
          {SERVINGS_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}人分
            </option>
          ))}
        </select>
        <button
          onClick={handleAiClick}
          className={`w-full text-sm ${
            isCook
              ? "luxury-btn luxury-btn-primary"
              : "luxury-btn luxury-btn-outline opacity-50 cursor-not-allowed"
          }`}
        >
          このメニューの作り方をAIに提案してもらう
        </button>
      </div>

      {/* アコーディオン */}
      <RecipeAccordion
        isExpanded={expandedRecipeId === recipe.id}
        isLoading={recipeDetailLoading[recipe.id]}
        detail={recipeDetailMap[recipe.id]}
        onToggle={() => onToggleDetail(recipe.id, recipe.id)}
      />
    </div>
  );
}

// ── メインコンポーネント ──

export default function FamilySuggestionPage() {
  const router = useRouter();

  // ── state ──
  const [recipeList, setRecipeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuList, setMenuList] = useState([]);
  const [goodCount, setGoodCount] = useState({});
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [servingsMap, setServingsMap] = useState({});
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [recipeDetailMap, setRecipeDetailMap] = useState({});
  const [recipeDetailLoading, setRecipeDetailLoading] = useState({});
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeData, setRecipeData] = useState(null);
  const [currentRecipeId, setCurrentRecipeId] = useState(null);
  const [members, setMembers] = useState([]);
  const [todayCookId, setTodayCookId] = useState(null);
  const [cookSelectMessage, setCookSelectMessage] = useState("");
  const [myMemberId, setMyMemberId] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  // ── 家族レシピ一覧取得 ──
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/recipes/family");
      setRecipeList(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("家族の献立取得に失敗しました:", error);
      setRecipeList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 認証 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── 初期データ取得（メンバー・ファミリー・メニュー・レシピを一括） ──
  useEffect(() => {
    if (!authenticated) return;

    const fetchInitialData = async () => {
      try {
        const [membersRes, meRes, familyRes, menusRes] = await Promise.all([
          apiClient.get("/api/members"),
          apiClient.get("/api/members/me"),
          apiClient.get("/api/families"),
          apiClient.get("/api/menus"),
        ]);

        // メンバー
        setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
        setMyMemberId(meRes.data?.member?.id || meRes.data?.id || null);
        setTodayCookId(familyRes.data?.today_cook_id || null);

        // メニュー + good count
        const menus = Array.isArray(menusRes.data)
          ? menusRes.data
          : menusRes.data
            ? [menusRes.data]
            : [];
        setMenuList(menus);

        const countMap = {};
        await Promise.all(
          menus.map(async (m) => {
            try {
              const countRes = await apiClient.get("/api/goods/count", {
                params: { menu_id: m.id },
              });
              countMap[m.id] = Number(countRes.data.count) || 0;
            } catch {
              countMap[m.id] = 0;
            }
          }),
        );
        setGoodCount(countMap);
      } catch (error) {
        console.error("初期データ取得失敗:", error);
      }

      // レシピ一覧は並行で取得
      await fetchRecipes();
    };

    fetchInitialData();
  }, [authenticated, fetchRecipes]);

  // ── 料理担当者選択 ──
  const handleSelectCook = useCallback(async (memberId) => {
    try {
      setCookSelectMessage("");

      await apiClient.post("/api/families/assign_cook", {
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
  }, []);

  // ── リクエストを献立一覧に追加 ──
  const handleAddFromMenu = useCallback(async () => {
    if (!selectedMenuId) {
      alert("メニューを選んでください");
      return;
    }
    if (!todayCookId) {
      alert(
        "料理担当者が設定されていません。上のドロップダウンから料理担当者を設定してください。",
      );
      return;
    }
    if (myMemberId && todayCookId !== myMemberId) {
      const cookName =
        members.find((m) => m.id === todayCookId)?.name || "別のメンバー";
      alert(
        `献立一覧に加えられるのは本日の料理担当者（${cookName}）のみです。`,
      );
      return;
    }

    const id = Number(selectedMenuId);
    if (Number.isNaN(id)) return;
    const selectedMenu = menuList.find((m) => m.id === id);
    if (!selectedMenu) return;

    try {
      const proposerName = selectedMenu.member?.name || "不明";
      /* eslint-disable camelcase */
      await apiClient.post("/api/recipes", {
        dish_name: selectedMenu.name,
        proposer: todayCookId,
        reason: `${proposerName}が提案した料理です`,
      });
      /* eslint-enable camelcase */
      alert("過去の献立一覧に追加しました！");
      setSelectedMenuId("");
      await fetchRecipes();
    } catch (error) {
      console.error("献立追加失敗:", error);
      alert("献立の追加に失敗しました");
    }
  }, [
    selectedMenuId,
    todayCookId,
    myMemberId,
    members,
    menuList,
    fetchRecipes,
  ]);

  // ── レシピ説明リクエスト（AIに作り方を聞く） ──
  const handleFetchRecipe = useCallback(
    async (dishName, numServings = 4, recipeId = null) => {
      if (!dishName) {
        alert("料理するメニューを選んでください");
        return;
      }

      setRecipeLoading(true);
      setShowRecipeModal(true);
      setRecipeData(null);
      setCurrentRecipeId(recipeId);

      try {
        const res = await apiClient.post("/api/recipes/explain", {
          dish_name: dishName,
          servings: Number(numServings),
        });
        setRecipeData(res.data?.recipe);
      } catch (error) {
        console.error("レシピ説明取得失敗:", error);
        alert("レシピ説明の取得に失敗しました");
        setShowRecipeModal(false);
      } finally {
        setRecipeLoading(false);
      }
    },
    [],
  );

  // ── レシピ保存 ──
  const handleSaveRecipe = useCallback(async () => {
    if (!recipeData || !currentRecipeId) return;
    try {
      /* eslint-disable camelcase */
      await apiClient.post(`/api/recipes/${currentRecipeId}`, {
        servings: recipeData.servings,
        missing_ingredients: recipeData.missing_ingredients,
        cooking_time: recipeData.cooking_time,
        steps: recipeData.steps,
      });
      setRecipeDetailMap((prev) => ({
        ...prev,
        [currentRecipeId]: {
          servings: recipeData.servings,
          cooking_time: recipeData.cooking_time,
          missing_ingredients: recipeData.missing_ingredients,
          steps: recipeData.steps,
        },
      }));
      /* eslint-enable camelcase */
      alert("献立に追加しました！");
      setShowRecipeModal(false);
      setSelectedMenuId("");
      await fetchRecipes();
    } catch (error) {
      console.error("献立保存失敗:", error);
      alert("献立の保存に失敗しました");
    }
  }, [recipeData, currentRecipeId, fetchRecipes]);

  // ── レシピ削除 ──
  const handleDeleteRecipe = useCallback(async (recipeId, dishName) => {
    if (!confirm(`「${dishName}」を献立一覧から削除しますか？`)) return;
    try {
      await apiClient.delete(`/api/recipes/${recipeId}`);
      setRecipeList((prev) => prev.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error("レシピ削除失敗:", error);
      alert("削除に失敗しました");
    }
  }, []);

  // ── レシピ詳細アコーディオン展開 ──
  const handleToggleRecipeDetail = useCallback(
    async (suggestionId, recipeId) => {
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
    },
    [expandedRecipeId, recipeDetailMap],
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
            🏠 わが家の献立
          </h1>
          <p className="text-sm text-muted text-center max-w-lg">
            料理するメニューを選択して、AIに作り方を提案してもらいましょう。
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {NAV_LINKS.map(({ href, icon, label, variant }) => (
              <Link
                key={href}
                href={href}
                className={`luxury-btn luxury-btn-${variant} flex items-center gap-2`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ─── リクエストを献立に追加 ─── */}
        <div className="luxury-card max-w-2xl mx-auto mb-8">
          <label className="luxury-label text-center block mb-4">
            【家族からのリクエストを献立一覧に加える】
          </label>
          <div className="space-y-4">
            {/* 料理担当者 */}
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

            {/* メニュー選択 */}
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
              onClick={handleAddFromMenu}
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

        {/* ─── レシピ説明モーダル ─── */}
        <RecipeModal
          show={showRecipeModal}
          loading={recipeLoading}
          data={recipeData}
          onClose={() => setShowRecipeModal(false)}
          onSave={handleSaveRecipe}
        />

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
            {recipeList.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                members={members}
                myMemberId={myMemberId}
                servings={servingsMap[r.id] || "4"}
                onServingsChange={(val) =>
                  setServingsMap((prev) => ({ ...prev, [r.id]: val }))
                }
                onFetchRecipe={handleFetchRecipe}
                onDelete={handleDeleteRecipe}
                expandedRecipeId={expandedRecipeId}
                recipeDetailMap={recipeDetailMap}
                recipeDetailLoading={recipeDetailLoading}
                onToggleDetail={handleToggleRecipeDetail}
              />
            ))}
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
