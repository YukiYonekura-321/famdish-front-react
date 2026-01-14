"use client";

import {
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  sendSignInLinkToEmail,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecoveryPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        router.replace("/");
      } else {
        return;
      }
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, [router]);

  const sendLoginLink = async (e) => {
    e.preventDefault();
    setSending(true);

    // 例: https://yourdomain.com/ に飛ばす
    const actionCodeSettings = {
      url: `${window.location.origin}`,
      handleCodeInApp: true, // ログインURL送信の場合はTrue
    };

    auth.languageCode = "ja";

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length === 0) {
        setEmail("");
        alert(
          `${email}が登録済みである場合、ログイン用のURLが送られています。`,
        );
        return;
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      setEmail("");
      alert(`${email}が登録済みである場合、ログイン用のURLが送られています。`);
      return;
    } catch (error) {
      alert(
        `${email}へのログイン用URLの送信に失敗しました。\n${error.message}`,
      );
    }
  };

  return (
    <div>
      <Header />
      <div className="relative w-full min-h-screen p-8">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex-col text-center space-y-8">
          <h1 className="text-6xl font-bold text-black drop-shadow-lg">
            リカバリー
          </h1>

          <p>登録しているメールアドレスにログイン用のURLを送信します。</p>

          <form onSubmit={sendLoginLink}>
            <label htmlFor="email">登録しているメールアドレス</label>
            <input
              className="gra-input mb-2 w-full"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
              }}
            />
            <button
              className="px-4 py-2 inline-block bg-gray-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
              type="submit"
              disabled={sending}
            >
              {sending ? "送信中..." : "送信"}
            </button>
          </form>

          <Link href={"/login"}>
            <p className="text-2xl font-semibold mb-2">ログインページに戻る</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
