/**
 * プロフィール登録フローの共通プログレスバー
 * @param {{ current: number, total: number }} props
 */
export function ProgressBar({ current, total }) {
  const pct = `${Math.round((current / total) * 100)}%`;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 sm:px-6 z-10">
      <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]">
            プロフィール登録
          </span>
          <span className="text-xs sm:text-sm text-muted">
            ステップ {current}/{total}
          </span>
        </div>
        <div className="h-2 bg-[var(--cream-100)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--sage-400)] to-[var(--sage-500)] transition-all duration-500 ease-out"
            style={{ width: pct }}
          />
        </div>
      </div>
    </div>
  );
}
