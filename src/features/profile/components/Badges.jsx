export function CheckBadge() {
  return (
    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--sage-500)] flex items-center justify-center">
      <svg
        className="w-3 h-3 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

export function XBadge() {
  return (
    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--secondary)] flex items-center justify-center">
      <svg
        className="w-3 h-3 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
}
