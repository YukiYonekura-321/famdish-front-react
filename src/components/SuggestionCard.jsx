export default function SuggestionCard({ suggestion, onOk, onRetry, onNg }) {
  // 複数日分の場合は配列、1日分の場合はオブジェクト
  const isMultiDay = Array.isArray(suggestion);
  const items = isMultiDay ? suggestion : [suggestion];

  // 制約不足で料理が作れないかチェック
  const hasError = (item) => item.title === "料理は作れません";

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`luxury-card max-w-3xl mx-auto animate-fade-in-up ${
            hasError(item) ? "border-2 border-[var(--terracotta-300)]" : ""
          }`}
        >
          {/* 複数日の場合は日付ヘッダー */}
          {isMultiDay && (
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[var(--sage-50)] border border-[var(--sage-200)]">
              <span className="text-lg">📅</span>
              <span
                className="text-sm font-medium text-[var(--sage-600)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.day}日目
              </span>
            </div>
          )}

          {hasError(item) ? (
            /* ── 制約不足エラー表示 ── */
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚠️</span>
                <h2
                  className="text-xl font-medium text-[var(--terracotta-600)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h2>
              </div>

              <div className="mb-4 p-4 rounded-2xl bg-[var(--terracotta-50)] border border-[var(--terracotta-200)]">
                <span className="luxury-label text-base block mb-2 text-[var(--terracotta-600)]">
                  理由
                </span>
                <p className="text-[var(--terracotta-600)] leading-relaxed">
                  {item.reason}
                </p>
              </div>

              {item.ingredients && item.ingredients.length > 0 && (
                <div className="mb-4">
                  <span className="luxury-label text-base block mb-2">
                    必要な材料
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ingredient, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-sm font-medium
                                 bg-[var(--terracotta-100)] text-[var(--terracotta-600)]
                                 border border-[var(--terracotta-200)]"
                      >
                        🛒 {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── 正常な献立表示 ── */
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🍽️</span>
                <h2
                  className="text-2xl font-medium text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {isMultiDay ? item.title : "献立案"}
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {!isMultiDay && (
                  <div>
                    <span className="luxury-label text-base block mb-2">
                      タイトル
                    </span>
                    <p
                      className="text-lg"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.title}
                    </p>
                  </div>
                )}

                <div>
                  <span className="luxury-label text-base block mb-2">
                    選んだ理由
                  </span>
                  <p className="text-muted leading-relaxed">{item.reason}</p>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div>
                    <span className="luxury-label text-base block mb-2">
                      調理時間
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-medium text-[var(--primary)]">
                        {item.time}
                      </span>
                      <span className="text-muted">分</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="luxury-label text-base block mb-2">
                    材料
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ingredient, i) => (
                      <span key={i} className="luxury-badge">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* アクションボタン（カード群の下に1つだけ表示） */}
      <div className="max-w-3xl mx-auto">
        <div className="divider"></div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            className="luxury-btn luxury-btn-primary flex-1 flex items-center justify-center gap-2"
            onClick={onOk}
          >
            <span>👍</span>
            <span>{isMultiDay ? "この献立に決定" : "この献立に決定"}</span>
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
    </div>
  );
}
