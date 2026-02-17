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
        👤 メンバー一覧
      </MobileNavLink>
      <MobileNavLink href="/menus" onClick={onClick}>
        📋 リクエスト
      </MobileNavLink>
      <MobileNavLink href="/menus/familysuggestion" onClick={onClick}>
        🏠 わが家の献立
      </MobileNavLink>
      <MobileNavLink href="/stock" onClick={onClick}>
        🧊 冷蔵庫
      </MobileNavLink>
      <li className="relative">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          onBlur={(e) => {
            // フォーカスがコンテナ外に移動したら閉じる
            const related = e.relatedTarget;
            if (!e.currentTarget.parentElement?.contains(related)) {
              setOpen(false);
            }
          }}
          className="text-[var(--foreground)] block py-3 px-4 hover:bg-[var(--surface)] transition-colors duration-300 rounded-lg font-medium w-full text-left"
          aria-expanded={open}
        >
          ⚙️ マイページ
        </button>

        {/* プルダウンメニュー（open 状態で表示） */}
        <div
          className={`absolute right-0 mt-1 w-56 bg-[var(--surface)] backdrop-blur-md shadow-xl rounded-lg py-2 border border-[var(--border)] ${
            open ? "block" : "hidden"
          }`}
        >
          <Link
            href="/mypage/invite"
            onClick={() => {
              setOpen(false);
              onClick?.();
            }}
            className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors duration-300 rounded-md mx-1"
          >
            ログインできない家族を登録
          </Link>

          <Link
            href="/mypage/social"
            onClick={() => {
              setOpen(false);
              onClick?.();
            }}
            className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors duration-300 rounded-md mx-1"
          >
            ソーシャルアカウント連携状態
          </Link>

          <Link
            href="/mypage/email"
            onClick={() => {
              setOpen(false);
              onClick?.();
            }}
            className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors duration-300 rounded-md mx-1"
          >
            通知先メールアドレス変更
          </Link>

          <button
            onClick={() => {
              setOpen(false);
              onClick?.();
              logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors duration-300 rounded-md mx-1"
          >
            ログアウト
          </button>

          <Link
            href="/mypage/withdraw"
            onClick={() => {
              setOpen(false);
              onClick?.();
            }}
            className="block px-4 py-2 text-sm text-red-500 hover:bg-[var(--surface-hover)] transition-colors duration-300 rounded-md mx-1"
          >
            退会
          </Link>
        </div>
      </li>
    </>
  );
}
