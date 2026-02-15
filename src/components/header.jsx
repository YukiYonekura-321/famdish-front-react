"use client";

import Link from "next/link";
import HamburgerButton from "./HamburgerButton";
import MobileMenuItems from "./MobileMenuItems";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-[var(--border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            className="text-display text-3xl font-medium text-[var(--foreground)] tracking-tight hover:text-[var(--primary)] transition-colors duration-300"
            href="/"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FamDish
          </Link>

          {/* PCナビ */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              className="px-5 py-2.5 text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 font-medium rounded-full hover:bg-[var(--surface)]"
              href="/"
            >
              ホーム
            </Link>

            <Link
              className="px-5 py-2.5 text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 font-medium rounded-full hover:bg-[var(--surface)]"
              href="/sign-in"
            >
              新規登録
            </Link>

            <Link
              className="luxury-btn luxury-btn-primary ml-2"
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
              <nav className="absolute top-full right-0 left-0 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border)] shadow-lg">
                <ul className="flex flex-col p-4">
                  <MobileMenuItems onClick={() => setMenuOpen(false)} />
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
