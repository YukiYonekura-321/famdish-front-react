import Link from "next/link";

export function Header() {
  return (
    <header>
      <Link href="/">FamDish</Link>

      <Link href="/about">FamDishとは</Link>

      <Link href="/users">API呼び出し</Link>
    </header>
  );
}
