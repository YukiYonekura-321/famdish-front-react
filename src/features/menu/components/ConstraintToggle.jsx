/** 制約タイプ切替ボタン */
export function ConstraintToggle({ constraintType, onSelect }) {
  const types = [
    { key: "budget", icon: "💰", label: "予算で絞る" },
    { key: "time", icon: "⏱️", label: "調理時間で絞る" },
  ];
  return (
    <div className="flex gap-2 mb-4">
      {types.map(({ key, icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
            constraintType === key
              ? "bg-[var(--sage-100)] border-[var(--sage-400)] text-[var(--sage-700)] shadow-sm"
              : "bg-white border-[var(--cream-200)] text-[var(--warm-gray-500)] hover:border-[var(--sage-300)]"
          }`}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
}
