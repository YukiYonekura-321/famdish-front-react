/** 不足食材リスト（モーダル・アコーディオン共通） */
export function MissingIngredients({ items, heading = "不足食材" }) {
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
