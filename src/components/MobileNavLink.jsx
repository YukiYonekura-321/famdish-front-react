import Link from "next/link";

export default function MobileNavLink({
  href,
  children,
  onClick,
  className = "",
}) {
  return (
    <li>
      <Link href={href} className={`text-white ${className}`} onClick={onClick}>
        {children}
      </Link>
    </li>
  );
}
