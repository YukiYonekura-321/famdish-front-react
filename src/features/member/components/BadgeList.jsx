/** バッジリストコンポーネント（カード内の表示用） */
export function BadgeList({ items, memberId, variant, emptyText }) {
  if (!items?.length) {
    return <span className="text-muted text-sm">{emptyText}</span>;
  }
  return items.map((item) => (
    <span
      key={`${variant}-${memberId}-${item.id}`}
      className={`luxury-badge luxury-badge-${variant}`}
    >
      {item.name}
    </span>
  ));
}
