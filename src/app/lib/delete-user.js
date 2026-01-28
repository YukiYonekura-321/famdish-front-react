import { getProvider } from "@/app/lib/provider-utils";
import { auth } from "@/app/lib/firebase";
import { reauthenticateWithPopup } from "firebase/auth";

export const deleteUser = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("ログインしてください");
    return;
  }

  const provider = getProvider(user);

  const result = confirm("退会しますか？");
  if (!result) return;

  try {
    // 再認証が必要な場合はプロバイダで再認証
    if (provider) {
      await reauthenticateWithPopup(user, provider);
    }

    await user.delete();
    alert("退会しました");
    // コンポーネント側で router を使っている場合もあるが、ユーティリティ側で確実に遷移させる
    window.location.href = "/login";
  } catch (error) {
    if (error?.code === "auth/requires-recent-login") {
      alert("安全のため再ログインが必要です");
      window.location.href = "/login";
    } else {
      alert(`退会に失敗しました\n${error?.message}`);
    }
  }
};
