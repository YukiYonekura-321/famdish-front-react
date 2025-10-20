import Link from "next/link";

export function Footer() {
  return (
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      <Link className="text-[32px] mr-16 w-1/3" href="/">
        FamDish
      </Link>
      <ul className="flex flex-1 divide-x-2 divide-blue-200 divide-dotted bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
        <Link className="flex-1 text-center w-5/6 list-decimal" href="/about">
          FamDishとは
        </Link>

        <Link className="flex-1 text-center w-5/6 list-decimal" href="/users">
          API呼び出し
        </Link>

        <Link
          className="flex-1 border text-center rounded-ee -xl list-decimal w-5/6"
          href="/signup"
        >
          新規登録
        </Link>
      </ul>
    </footer>
  );
}
