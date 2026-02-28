/** 情報項目 */
export function InfoItem({ icon, text }) {
  return (
    <li className="flex items-start gap-3 group">
      <span className="text-xl transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <span className="text-[var(--foreground)] flex-1 leading-relaxed">
        {text}
      </span>
    </li>
  );
}
