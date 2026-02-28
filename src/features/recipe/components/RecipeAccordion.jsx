import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { MissingIngredients } from "./MissingIngredients";

/** レシピ詳細アコーディオン */
export function RecipeAccordion({ isExpanded, isLoading, detail, onToggle }) {
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
