"use client";
import Link from "next/link";
import { useState } from "react";
import MobileNavLink from "./MobileNavLink";
import { auth } from "@/app/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function MobileAuthMenuItems({ onClick }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      console.error("❌ Logout failed", err);
    }
  };
  return (
    <>
      <MobileNavLink href="/members" onClick={onClick}>
        💌 家族を招待
      </MobileNavLink>
      <MobileNavLink href="/members/index" onClick={onClick}>
        メンバー一覧
      </MobileNavLink>
      <MobileNavLink href="/menus" onClick={onClick}>
        リクエスト
      </MobileNavLink>
      <MobileNavLink href="/menus/familysuggestion" onClick={onClick}>
        🏠 わが家の献立
      </MobileNavLink>
      <li className="relative">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="text-[var(--foreground)] w-full text-left py-3 px-4 hover:bg-[var(--surface)] transition-colors duration-300 rounded-lg font-medium"
          aria-expanded={open}
        >
          マイページ設定
        </button>

        {/* プルダウンメニュー */}
        {open && (
          <div className="mt-2 ml-4 space-y-1 animate-fade-in">
            <Link
              href="/mypage/invite"
              onClick={() => {
                setOpen(false);
                onClick?.();
              }}
              className="block px-4 py-2 text-sm text-muted hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-colors rounded-lg"
            >
              ログインできない家族を登録
            </Link>

            <Link
              href="/mypage/social"
              onClick={() => {
                setOpen(false);
                onClick?.();
              }}
              className="block px-4 py-2 text-sm text-muted hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-colors rounded-lg"
            >
              ソーシャルアカウント連携状態
            </Link>

            <Link
              href="/mypage/email"
              onClick={() => {
                setOpen(false);
                onClick?.();
              }}
              className="block px-4 py-2 text-sm text-muted hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-colors rounded-lg"
            >
              通知先メールアドレス変更
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                onClick?.();
                logout();
              }}
              className="w-full text-left px-4 py-2 text-sm text-muted hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-colors rounded-lg"
            >
              ログアウト
            </button>

            <Link
              href="/mypage/withdraw"
              onClick={() => {
                setOpen(false);
                onClick?.();
              }}
              className="block px-4 py-2 text-sm text-[var(--secondary)] hover:bg-[var(--terracotta-50)] transition-colors rounded-lg"
            >
              退会
            </Link>
          </div>
        )}
      </li>
    </>
  );
}
