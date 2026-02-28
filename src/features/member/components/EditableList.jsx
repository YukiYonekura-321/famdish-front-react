/** 編集リストコンポーネント（likes / dislikes 共通） */
export function EditableList({ label, items, setItems, setRemovedIds }) {
  const handleChange = (idx, value) => {
    const updated = [...items];
    updated[idx] = { ...items[idx], name: value };
    setItems(updated);
  };

  const handleRemove = (idx) => {
    const removed = items[idx];
    if (removed?.id) setRemovedIds((prev) => [...prev, removed.id]);
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="luxury-label text-sm">{label}</label>
      {items.map((item, idx) => (
        <div key={`edit-${label}-${idx}`} className="flex gap-2 mb-3">
          <input
            type="text"
            value={item.name}
            onChange={(e) => handleChange(idx, e.target.value)}
            className="luxury-input flex-1"
          />
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            className="px-4 py-2 bg-[var(--terracotta-100)] text-[var(--terracotta-600)] rounded-xl hover:bg-[var(--terracotta-200)] transition-colors font-medium text-sm"
          >
            削除
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems([...items, { name: "" }])}
        className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
      >
        + 追加
      </button>
    </div>
  );
}
