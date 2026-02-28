import Link from "next/link";

export default function MobileNavLink({
  href,
  children,
  onClick,
  className = "",
}) {
  return (
    <li>
      <Link
        href={href}
        className={`text-[var(--foreground)] block py-3 px-4 hover:bg-[var(--surface)] transition-colors duration-300 rounded-lg font-medium ${className}`}
        onClick={onClick}
      >
        {children}
      </Link>
    </li>
  );
}
