import { signInWithEmailLink } from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { getLinkedProviderIds } from "@/features/auth/lib/provider-utils";

export const handleEmailSignIn = async () => {
  const email = window.prompt("確認のためメールアドレスを入力してください");

  try {
    const result = await signInWithEmailLink(auth, email, window.location.href);
    const linkedProviderIds = getLinkedProviderIds(result.user);

    // 仮登録中のメールアドレスでメールリンクログインをするとFirebase Authの仕様でIdPの連携が解除される
    if (linkedProviderIds.length === 0) {
      alert("メールが使えない場合に備えて、\nIdPとの連携を行ってください。");
    }
  } catch (error) {
    alert(`ログインに失敗しました:${error.message}`);
  }
};
