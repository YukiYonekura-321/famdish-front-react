import Link from "next/link";

export default function DropdownLink({ href, children, danger = false }) {
  if (danger) {
    return (
      <Link
        href={href}
        className="group relative flex px-4 py-3 rounded-2xl transition-all duration-300
                   hover:bg-[var(--terracotta-50)] items-center"
      >
        <span
          className="font-medium transition-colors group-hover:text-[var(--secondary)]"
          style={{ color: "var(--secondary)" }}
        >
          {children}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group relative flex px-4 py-3 rounded-2xl transition-all duration-300
                 hover:bg-[var(--cream-100)] items-center"
    >
      <span className="font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
        {children}
      </span>

      {/* Hover accent line */}
      <span
        className="absolute left-4 bottom-2 w-0 h-px bg-gradient-to-r from-[var(--gold-400)] to-[var(--terracotta-400)]
                   transition-all duration-300 group-hover:w-12"
      />
    </Link>
  );
}
