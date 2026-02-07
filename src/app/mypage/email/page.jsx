"use client";

import {
  onAuthStateChanged,
  verifyBeforeUpdateEmail,
  reauthenticateWithPopup,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { getProvider } from "@/app/lib/provider-utils";
import { auth } from "@/app/lib/firebase";
import { AuthHeader } from "@/components/auth_header";
import { useRouter } from "next/navigation";

// LoginPage というReactコンポーネントを定義
// ボタンを表示して、クリックすると login 関数が呼ばれ、Googleログイン開始
export default function MyPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email || "");
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, [router]);

  const updateEmail = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.elements.email.value;
    const actionCodeSettings = {
      url: `http://${location.host}/login`,
    };

    auth.language = "ja";

    const user = auth.currentUser;

    // 登録している自分のメールアドレスを入力した場合
    if (user.email === email) {
      alert(`${email}は登録済みです`);
      form.reset();
      return;
    }

    const provider = getProvider(user);

    try {
      // メールアドレスを更新する前に再認証。失敗するとエラーが発生する
      await reauthenticateWithPopup(user, provider);
      await verifyBeforeUpdateEmail(user, email, actionCodeSettings);
      alert(
        `${email}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`,
      );
      form.reset();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert(
          `${email}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`,
        );
        form.reset();
        return;
      }
      alert(`メールの送信に失敗しました\n${error.message}`);
    }
  };

  return (
    <div className="relative w-full min-h-screen p-8">
      <AuthHeader />
      <div className="relative w-full min-h-screen p-8">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex-col text-center space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black drop-shadow-lg">
            現在のメールアドレス
          </h1>
          <p className="inline-block text-center drop-shadow-lg">{email}</p>
          <form onSubmit={updateEmail}>
            <label htmlFor="email">新しいメールアドレス</label>
            <input
              className="gra-input mb-2 w-full"
              name="email"
              type="email"
            />
            <button
              className="px-4 py-2 inline-block bg-green-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
              type="submit"
            >
              変更
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
