"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { useState, useEffect } from "react";
import { apiClient } from "@/app/lib/api";
import HamburgerButton from "./HamburgerButton";
import MobileAuthMenuItems from "./MobileAuthMenuItems";
import { onAuthStateChanged } from "firebase/auth";

export function AuthHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // まず API でメンバー情報を取得して表示名を上書きできるか試す
        try {
          const res = await apiClient.get("/api/members/me");
          const data = res?.data || {};
          console.log(data);
          setDisplayName(data.username || "");
        } catch (error) {
          console.error("メンバー取得失敗", error);
          // フォールバック処理
          setDisplayName("");
        }
      } else {
        setDisplayName("");
      }
    });
    return () => unsub();
  }, []);

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
          💌 家族を招待
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

        <div
          tabIndex={0}
          className="relative"
          onBlur={(e) => {
            // フォーカスがコンポーネント外に移動したら閉じる
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
          }}
        >
          <div
            className="text-white block leading-16 px-2 md:px-3 py-1 md:py-0 bg-gray-600/50 hover:bg-gray-500/50 transition duration-300 text-sm md:text-base cursor-pointer"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            マイページ{` — ${displayName}`}
          </div>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-zinc-800/95 backdrop-blur shadow-lg rounded-md py-2">
              <Link
                href="/mypage/invite"
                className="block px-4 py-2 text-sm text-white hover:bg-zinc-700 transition"
              >
                ログインできない家族を登録
              </Link>

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
          )}
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
