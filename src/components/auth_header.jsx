"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { useState } from "react";
import HamburgerButton from "./HamburgerButton";
import MobileAuthMenuItems from "./MobileAuthMenuItems";

export function AuthHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      console.error("❌ Logout failed", err);
    }
  };

  return (
    <header className="flex justify-between items-center h-16 fixed top-0 left-0 w-full z-50 backdrop-blur bg-zinc-800/50">
      <Link className="p-4 text-white text-[32px]" href="/">
        FamDish
      </Link>
      <nav className="hidden md:flex md:gap-0 gap-3 flex-wrap items-center">
        <Link
          className="text-white block leading-16 px-2 md:px-3 py-1 md:py-0 bg-gray-600/50 hover:bg-gray-500/50 transition duration-500 text-sm md:text-base"
          href="/members"
        >
          メンバー登録
        </Link>

        <Link
          className="text-white block leading-16 px-2 md:px-3 py-1 md:py-0 bg-gray-600/50 hover:bg-gray-500/50 transition duration-500 text-sm md:text-base"
          href="/members/index"
        >
          メンバー一覧
        </Link>

        <Link
          className="text-white block leading-16 px-2 md:px-3 py-1 md:py-0 bg-gray-600/50 hover:bg-gray-500/50 transition duration-500 text-sm md:text-base"
          href="/menus"
        >
          リクエスト
        </Link>

        <Link
          className="text-white block leading-16 px-2 md:px-3 py-1 md:py-0 bg-gray-600/50 hover:bg-gray-500/50 transition duration-500 text-sm md:text-base"
          href="/menus/index"
        >
          リクエスト一覧
        </Link>

        <div className="relative group">
          <div className="text-white block leading-16 px-2 md:px-3 py-1 md:py-0 bg-gray-600/50 hover:bg-gray-500/50 transition duration-300 text-sm md:text-base">
            マイページ
          </div>

          {/* プルダウンメニュー */}
          <div className="absolute right-0 top-full mt-1 w-56 hidden group-hover:block bg-zinc-800/95 backdrop-blur shadow-lg rounded-md py-2">
            <Link
              href="/mypage/social"
              className="block px-4 py-2 text-sm text-white hover:bg-zinc-700 transition"
            >
              ソーシャルアカウント連携状態
            </Link>

            <Link
              href="/mypage/email"
              className="block px-4 py-2 text-sm text-white hover:bg-zinc-700 transition"
            >
              通知先メールアドレス変更
            </Link>

            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition"
            >
              ログアウト
            </button>

            <Link
              href="/mypage/withdraw"
              className="block px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition"
            >
              退会
            </Link>
          </div>
        </div>
      </nav>

      {/* ハンバーガーボタン（スマホのみ） */}
      <div className="md:hidden">
        <HamburgerButton onToggle={(open) => setMenuOpen(open)} />
        {/* モバイルメニュー */}
        {menuOpen && (
          <nav className="absolute top-full right-0 left-0 z-20 bg-zinc-900/90 backdrop-blur-sm">
            <ul className="flex flex-col space-y-4 p-4">
              <MobileAuthMenuItems onClick={() => setMenuOpen(false)} />
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
