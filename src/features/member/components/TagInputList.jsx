/** タグ選択 + テキスト入力の共通コンポーネント */
export function TagInputList({
  label,
  icon,
  items,
  candidates,
  placeholder,
  onChange,
  selectedColor = "bg-[var(--primary)] text-white border-[var(--primary)]",
  hoverColor = "hover:border-[var(--primary)] hover:text-[var(--primary)]",
}) {
  const handleToggleTag = (tag) => {
    if (items.includes(tag)) {
      onChange(items.filter((v) => v !== tag));
    } else {
      const emptyIdx = items.findIndex((v) => v === "");
      if (emptyIdx !== -1) {
        const next = [...items];
        next[emptyIdx] = tag;
        onChange(next);
      } else {
        onChange([...items, tag]);
      }
    }
  };

  const handleChangeAt = (idx, value) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };

  const handleRemoveAt = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="luxury-label text-sm flex items-center gap-1 mb-3">
        <span>{icon}</span> {label}
      </label>

      {/* タグ選択 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {candidates.map((tag) => {
          const selected = items.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleToggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selected
                  ? selectedColor
                  : `bg-[var(--card)] text-muted border-[var(--border)] ${hoverColor}`
              }`}
            >
              {selected ? "✓ " : ""}
              {tag}
            </button>
          );
        })}
      </div>

      {/* テキスト入力 */}
      <div className="space-y-2">
        {items.map((value, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={value}
              placeholder={placeholder}
              onChange={(e) => handleChangeAt(idx, e.target.value)}
              className="luxury-select flex-1 text-sm"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveAt(idx)}
                className="text-muted hover:text-red-500 transition-colors text-lg px-1"
                title="削除"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-2 text-sm text-[var(--primary)] hover:opacity-80 transition-opacity flex items-center gap-1"
        onClick={() => onChange([...items, ""])}
      >
        <span>＋</span>
        <span>追加</span>
      </button>
    </div>
  );
}
