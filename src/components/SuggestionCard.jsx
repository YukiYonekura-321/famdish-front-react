export default function SuggestionCard({ suggestion, onOk, onRetry, onNg }) {
  return (
    <div className="luxury-card max-w-3xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🍽️</span>
        <h2
          className="text-2xl font-medium text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          献立案
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <span className="luxury-label text-base block mb-2">タイトル</span>
          <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
            {suggestion.title}
          </p>
        </div>

        <div>
          <span className="luxury-label text-base block mb-2">選んだ理由</span>
          <p className="text-muted leading-relaxed">{suggestion.reason}</p>
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <span className="luxury-label text-base block mb-2">調理時間</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-medium text-[var(--primary)]">
                {suggestion.time}
              </span>
              <span className="text-muted">分</span>
            </div>
          </div>
        </div>

        <div>
          <span className="luxury-label text-base block mb-2">材料</span>
          <div className="flex flex-wrap gap-2">
            {suggestion.ingredients.map((ingredient, idx) => (
              <span key={idx} className="luxury-badge">
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          className="luxury-btn luxury-btn-primary flex-1 flex items-center justify-center gap-2"
          onClick={onOk}
        >
          <span>👍</span>
          <span>この献立に決定</span>
        </button>

        <button
          className="luxury-btn luxury-btn-outline flex-1 flex items-center justify-center gap-2"
          onClick={onRetry}
        >
          <span>🔄</span>
          <span>別の案を見る</span>
        </button>

        <button
          className="luxury-btn luxury-btn-ghost flex-1 flex items-center justify-center gap-2 text-[var(--secondary)]"
          onClick={onNg}
          title="理由を記載することで、提案の精度が向上します"
        >
          <span>👎</span>
          <span>フィードバック</span>
        </button>
      </div>
    </div>
  );
}
