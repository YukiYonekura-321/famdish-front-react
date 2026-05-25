/** みんなの献立カード（ヒーローページ公開用） */
/** ToDo 将来的にPublicSuggestionCardと統合する予定 */
export function HeroSuggestionCard({ suggestion }) {
  return (
    <div className="luxury-card w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              🍽️ {suggestion.dish_name || "タイトルなし"}
            </h3>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="luxury-badge text-xs">
            家族：{suggestion.family_name}
          </span>
          <span className="text-xs text-muted">
            {suggestion.created_at
              ? new Date(suggestion.created_at).toLocaleDateString("ja-JP")
              : ""}
          </span>
        </div>
      </div>

      {suggestion.reason && (
        <p className="text-sm text-muted mt-3">💡 {suggestion.reason}</p>
      )}

      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted">
        {suggestion.cooking_time && <span>⏱️ {suggestion.cooking_time}分</span>}
        {suggestion.servings && <span>👥 {suggestion.servings}人分</span>}
      </div>
    </div>
  );
}
