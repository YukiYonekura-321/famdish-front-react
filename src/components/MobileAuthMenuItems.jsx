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
      <MobileNavLink href="/menus" onClick={onClick}>
        リクエスト
      </MobileNavLink>

      <button onClick={logout} className="text-white text-left">
        ログアウト
      </button>
    </>
  );
}
