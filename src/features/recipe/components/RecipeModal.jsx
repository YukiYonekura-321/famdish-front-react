import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { MissingIngredients } from "./MissingIngredients";
import { StepsList } from "./StepsList";

/** レシピ説明モーダル */
export function RecipeModal({
  show,
  loading: isLoading,
  data,
  onClose,
  onSave,
}) {
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
