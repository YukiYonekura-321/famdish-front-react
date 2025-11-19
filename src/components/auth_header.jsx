import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="flex justify-between items-center h-16 fixed top-0 left-0 w-full bg-zinc-800/50">
      <Link className="p-4 text-white text-[32px] mr-16" href="/">
        FamDish
      </Link>
      <ul className="flex space-x-8">
        <Link
          className="text-white block leading-16 px-4 bg-gray-600/50 hover:bg-gray-500/50 transition duration-500"
          href="/about"
        >
          メンバー登録
        </Link>

        <Link
          className="text-white block leading-16 px-4 bg-gray-600/50 mr-8 hover:bg-gray-500/50 transition duration-500"
          href="/menus"
        >
          リクエスト
        </Link>

        <Link
          className="text-white block leading-16 px-4 bg-gray-600/50 mr-8 hover:bg-gray-500/50 transition duration-500"
          href="#"
        >
          ログアウト
        </Link>
      </ul>
    </header>
  );
}
