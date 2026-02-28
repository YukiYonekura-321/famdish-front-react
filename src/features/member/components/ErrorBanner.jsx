/** エラーバナー */
export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="max-w-2xl mx-auto mb-8 backdrop-blur-xl bg-gradient-to-br from-[var(--terracotta-50)] to-white/80 border-2 border-[var(--terracotta-300)] rounded-3xl p-6 animate-scale-in">
      <div className="flex items-start gap-4">
        <span className="text-2xl">⚠️</span>
        <div>
          <div
            className="font-medium text-[var(--terracotta-600)] mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            エラーが発生しました
          </div>
          <p className="text-sm text-[var(--terracotta-600)]">{message}</p>
        </div>
      </div>
    </div>
  );
}
