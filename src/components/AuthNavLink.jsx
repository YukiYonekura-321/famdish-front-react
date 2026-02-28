import Link from "next/link";

export default function AuthNavLink({ href, children, icon }) {
  return (
    <Link
      href={href}
      className="group relative px-4 py-2.5 rounded-full transition-all duration-300
                 hover:bg-gradient-to-br from-[var(--cream-100)] to-[var(--cream-200)]"
      title={typeof children === "string" ? children : undefined}
    >
      <span
        className="relative z-10 font-medium text-[var(--foreground)]
                   transition-colors duration-300 group-hover:text-[var(--primary)]
                   flex items-center gap-1.5"
      >
        {icon && <span className="text-base">{icon}</span>}
        <span className="hidden lg:inline">{children}</span>
      </span>

      {/* Ripple glow */}
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                   transition-opacity duration-500 blur-md"
        style={{
          background:
            "radial-gradient(circle at center, var(--sage-200), transparent 70%)",
        }}
      />

      {/* Gold accent border */}
      <span
        className="absolute inset-0 rounded-full border border-[var(--gold-400)]/0
                   transition-all duration-300 group-hover:border-[var(--gold-400)]/30"
      />
    </Link>
  );
}
