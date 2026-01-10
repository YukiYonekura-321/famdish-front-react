"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";

export function AuthHeader() {
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (err) {
      console.error("❌ Logout failed", err);
    }
  };

  return (
    <header className="flex justify-between items-center h-16 fixed top-0 left-0 w-full bg-zinc-800/50">
      <Link className="p-4 text-white text-[32px] mr-16" href="/">
        FamDish
      </Link>
      <ul className="flex space-x-8">
        <Link
          className="text-white block leading-16 px-4 bg-gray-600/50 hover:bg-gray-500/50 transition duration-500"
          href="/members"
        >
          メンバー登録
        </Link>

        <Link
          className="text-white block leading-16 px-4 bg-gray-600/50 mr-8 hover:bg-gray-500/50 transition duration-500"
          href="/menus"
        >
          リクエスト
        </Link>

        <button
          onClick={logout}
          className="text-white block leading-16 px-4 bg-gray-600/60 hover:bg-gray-500/60 transition duration-500 mr-8"
        >
          ログアウト
        </button>
      </ul>
    </header>
  );
}
