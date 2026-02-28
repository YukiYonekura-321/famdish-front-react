"use client";

import { useState } from "react";
import Link from "next/link";
import HamburgerButton from "@/shared/components/HamburgerButton";
import MobileMenuItems from "@/shared/components/MobileMenuItems";

const NAV_LINK_CLASS =
  "px-5 py-2.5 text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 font-medium rounded-full hover:bg-[var(--surface)]";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-[var(--border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link
            href="/"
            className="text-3xl font-medium text-[var(--foreground)] tracking-tight hover:text-[var(--primary)] transition-colors duration-300"
            style={{ fontFamily: "var(--font-display)" }}
          >
            FamDish
          </Link>

          {/* PC ナビ */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/" className={NAV_LINK_CLASS}>
              ホーム
            </Link>
            <Link href="/sign-in" className={NAV_LINK_CLASS}>
              新規登録
            </Link>
            <Link href="/login" className="luxury-btn luxury-btn-primary ml-2">
              ログイン
            </Link>
          </nav>

          {/* モバイルメニュー */}
          <div className="md:hidden">
            <HamburgerButton onToggle={setMenuOpen} />
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
