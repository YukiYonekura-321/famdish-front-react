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
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-[var(--border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            className="text-3xl font-medium text-[var(--foreground)] tracking-tight hover:text-[var(--primary)] transition-colors duration-300"
            href="/"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FamDish
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              className="px-4 py-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 font-medium rounded-full hover:bg-[var(--surface)] flex items-center gap-1.5"
              href="/members"
            >
              <span>💌</span>
              <span>家族を招待</span>
            </Link>

            <Link
              className="px-4 py-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 font-medium rounded-full hover:bg-[var(--surface)]"
              href="/members/index"
            >
              メンバー一覧
            </Link>

            <Link
              className="px-4 py-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 font-medium rounded-full hover:bg-[var(--surface)]"
              href="/menus"
            >
              リクエスト
            </Link>

            <Link
              className="px-4 py-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 font-medium rounded-full hover:bg-[var(--surface)] flex items-center gap-1.5"
              href="/menus/familysuggestion"
            >
              <span>🏠</span>
              <span>わが家の献立</span>
            </Link>

            <div
              tabIndex={0}
              className="relative"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
              }}
            >
              <button
                className="px-4 py-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300 font-medium rounded-full hover:bg-[var(--surface)] flex items-center gap-2"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
              >
                <span>マイページ</span>
                {displayName && (
                  <span className="text-[var(--muted)] text-sm">— {displayName}</span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md border border-[var(--border)] shadow-lg rounded-2xl py-2 animate-fade-in">
                  <Link
                    href="/mypage/invite"
                    className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                  >
                    ログインできない家族を登録
                  </Link>

                  <Link
                    href="/mypage/social"
                    className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                  >
                    ソーシャルアカウント連携状態
                  </Link>

                  <Link
                    href="/mypage/email"
                    className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                  >
                    通知先メールアドレス変更
                  </Link>

                  <div className="divider my-1"></div>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                  >
                    ログアウト
                  </button>

                  <Link
                    href="/mypage/withdraw"
                    className="block px-4 py-2.5 text-sm text-[var(--secondary)] hover:bg-[var(--terracotta-50)] transition-colors"
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
            {menuOpen && (
              <nav className="absolute top-full right-0 left-0 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border)] shadow-lg">
                <ul className="flex flex-col p-4">
                  <MobileAuthMenuItems onClick={() => setMenuOpen(false)} />
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
