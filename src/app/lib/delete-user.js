import { getProvider } from "@/app/lib/provider-utils";
import { auth } from "@/app/lib/firebase";
import { reauthenticateWithPopup } from "firebase/auth";

export const deleteUser = async () => {
  const user = auth.currentUser;
  const provider = getProvider(user);

  const result = confirm("退会しますか？");
  if (!result) return;

  try {
    // 仮登録からメールリンクログインするとIdPと未連携のままログインできる
    if (provider) {
      // 退会する前に再認証。認証に失敗するとエラーが発生する
      await reauthenticateWithPopup(user, provider);
    }
    await user.delete();
    alert("退会しました");
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      alert("安全のため再ログインが必要です");
    } else {
      alert(`退会に失敗しました\n${error.message}`);
    }
  }
};
