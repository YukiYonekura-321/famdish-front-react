"use client";
import Link from "next/link";
import MobileNavLink from "./MobileNavLink";
import { auth } from "@/app/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function MobileAuthMenuItems({ onClick }) {
  const router = useRouter();

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
        メンバー登録
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
      <div className="relative group">
        <div className="text-white">マイページ設定</div>

        {/* プルダウンメニュー */}
        <div
          className="
              absolute right-0 mt-0 w-56
              hidden group-hover:block
              bg-zinc-800/95 backdrop-blur
              shadow-lg rounded-md
              py-2
            "
        >
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
    </>
  );
}
