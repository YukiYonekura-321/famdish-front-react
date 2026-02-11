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
      <MobileNavLink href="/menus/index" onClick={onClick}>
        リクエスト一覧
      </MobileNavLink>
      <div
        className="relative"
        tabIndex={0}
        onBlur={(e) => {
          // フォーカスがコンテナ外に移動したら閉じる
          const related = e.relatedTarget;
          if (!e.currentTarget.contains(related)) {
            setOpen(false);
          }
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="text-white"
          aria-expanded={open}
        >
          マイページ設定
        </button>

        {/* プルダウンメニュー（open 状態で表示） */}
        <div
          className={`absolute right-0 mt-0 w-56 bg-zinc-800/95 backdrop-blur shadow-lg rounded-md py-2 ${
            open ? "block" : "hidden"
          }`}
        >
          <Link
            href="/mypage/invite"
            onClick={() => {
              setOpen(false);
              onClick?.();
            }}
            className="block px-4 py-2 text-sm text-white hover:bg-zinc-700 transition"
          >
            ログインできない家族を登録
          </Link>

          <Link
            href="/mypage/social"
            onClick={() => {
              setOpen(false);
              onClick?.();
            }}
            className="block px-4 py-2 text-sm text-white hover:bg-zinc-700 transition"
          >
            ソーシャルアカウント連携状態
          </Link>

          <Link
            href="/mypage/email"
            onClick={() => {
              setOpen(false);
              onClick?.();
            }}
            className="block px-4 py-2 text-sm text-white hover:bg-zinc-700 transition"
          >
            通知先メールアドレス変更
          </Link>

          <button
            onClick={() => {
              setOpen(false);
              onClick?.();
              logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition"
          >
            ログアウト
          </button>

          <Link
            href="/mypage/withdraw"
            onClick={() => {
              setOpen(false);
              onClick?.();
            }}
            className="block px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition"
          >
            退会
          </Link>
        </div>
      </div>
    </>
  );
}
