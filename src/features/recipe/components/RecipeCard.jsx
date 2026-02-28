import { SERVINGS_OPTIONS } from "@/features/recipe/constants";
import { RecipeAccordion } from "./RecipeAccordion";

/** 献立カード1枚分 */
export function RecipeCard({
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
