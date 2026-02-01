"use client";

import Link from "next/link";
import HamburgerButton from "./HamburgerButton";
import MobileMenuItems from "./MobileMenuItems";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="flex justify-between items-center h-16 fixed top-0 left-0 w-full z-50 backdrop-blur bg-zinc-800/50">
      <Link className="p-4 text-white text-[32px] mr-16" href="/">
        FamDish
      </Link>

      {/* PCナビ */}
      <nav className="hidden md:flex space-x-8">
        <Link
          className="text-white block leading-16 px-4 bg-gray-600/50 hover:bg-gray-500/50 transition duration-500"
          href="/"
        >
          ホーム
        </Link>

        <Link
          className="text-white block leading-16 px-4 bg-gray-600/50 mr-8 hover:bg-gray-500/50 transition duration-500"
          href="/sign-in"
        >
          新規登録
        </Link>

        <Link
          className="text-white block leading-16 px-4 bg-gray-600/50 mr-8 hover:bg-gray-500/50 transition duration-500"
          href="/login"
        >
          ログイン
        </Link>
      </nav>

      {/* ハンバーガーボタン（スマホのみ） */}
      <div className="md:hidden">
        <HamburgerButton onToggle={(open) => setMenuOpen(open)} />
        {/* モバイルメニュー */}
        {menuOpen && (
          <nav className="absolute top-full right-0 left-0 z-20 bg-zinc-900/90 backdrop-blur-sm">
            <ul className="flex flex-col space-y-4 p-4">
              <MobileMenuItems onClick={() => setMenuOpen(false)} />
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
