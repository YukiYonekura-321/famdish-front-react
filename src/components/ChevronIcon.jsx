export default function ChevronIcon({ open = false, className = "" }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
