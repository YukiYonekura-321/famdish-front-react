import Link from "next/link";

/** 在庫バッジ一覧 */
export function StockBadges({ stocks }) {
  if (stocks.length === 0) {
    return (
      <p className="text-sm text-muted">
        在庫が登録されていません。
        <Link href="/stock" className="text-[var(--primary)] underline ml-1">
          冷蔵庫ページで登録する
        </Link>
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {stocks.map((s) => (
        <span
          key={s.id}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                     bg-[var(--sage-50)] text-[var(--sage-600)] border border-[var(--sage-200)]"
        >
          {s.name}
          <span className="text-[var(--sage-400)]">
            {s.quantity}
            {s.unit}
          </span>
        </span>
      ))}
    </div>
  );
}
