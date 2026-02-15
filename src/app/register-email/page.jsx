"use client";

import {
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";

export default function RegisterEmailPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const [redirectParam, setRedirectParam] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectParam(params.get("redirect"));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // メール認証完了後のリダイレクト：emailVerified=true を付与
        const loginUrl = redirectParam
          ? `/login?redirect=${encodeURIComponent(redirectParam)}&emailVerified=true`
          : "/login?emailVerified=true";
        router.replace(loginUrl);
        return;
      }

      // ユーザーが存在する場合、本登録状況を確認する
      // サーバ側で member が紐付いていれば本登録とみなし /menus へリダイレクト
      try {
        const res = await apiClient.get("/api/members/me");
        console.log(
          "members/me:",
          res?.data,
          "username:",
          res?.data?.username,
          typeof res?.data?.username,
        );
        if (res?.data?.username) {
          // 本登録済み
          console.trace("redirect to /menus");
          router.replace("/menus");
          return;
        }
      } catch (err) {
        console.error("member/me check failed", err);
      }

      // まだ本登録でない場合はフォームにプロバイダのメールを入れてページ表示
      setEmail(user.email || "");
      console.log(user.email);
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, [router, redirectParam]);

  const registerEmail = async (e) => {
    e.preventDefault();
    setSending(true);

    const emailToBeRegistered = email;
    console.log(`emailToBeRegister${emailToBeRegistered}`);

    const user = auth.currentUser;
    if (!user) {
      alert("認証情報を取得できませんでした。再度ログインしてください。");
      const loginUrl = redirectParam
        ? `/login?redirect=${encodeURIComponent(redirectParam)}`
        : "/login";
      router.replace(loginUrl);
      return;
    }
    auth.languageCode = "ja";

    // redirect パラメータがあれば actionCodeSettings.url に含める
    const redirectPath = redirectParam
      ? `?redirect=${encodeURIComponent(redirectParam)}`
      : "";
    const actionCodeSettings = {
      url: `${window.location.origin}/register-email${redirectPath}`,
    };

    // プロバイダから取得したメールアドレスとは別のものを登録する場合
    if (user.email !== emailToBeRegistered) {
      try {
        // 入力された emailToBeRegistered に確認メールを送信し、リンクをクリックしたらメールアドレスを更新する処理。
        // actionCodeSettings.url に指定したページへ遷移する。
        await verifyBeforeUpdateEmail(
          user,
          emailToBeRegistered,
          actionCodeSettings,
        );
        console.log(user.metadata.lastSignInTime);
        alert(`${emailToBeRegistered}に確認メールを送りました`);
        setEmail("");
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          const result = confirm(
            `${emailToBeRegistered}は他の SNS と連携した既存ユーザーで登録済みです。マイページにてこちらの SNS との連携が可能です。既存のユーザーでログインしなおしますか？`,
          );
          // 既存ユーザーでログインし直す場合
          if (result) {
            // SNS の認証に成功している時点でユーザーが作られており、このままでは既存ユーザーに連携できなくなるので、ここで削除
            await user.delete();
            const loginUrl = redirectParam
              ? `/login?redirect=${encodeURIComponent(redirectParam)}`
              : "/login";
            router.replace(loginUrl);
            return;
          }
          // Noの場合、フォームを初期化して終了
          setEmail("");
          return;
        } else if (error.code === "auth/requires-recent-login") {
          alert("安全のため、再ログインが必要です。");
          await signOut(auth);
          const loginUrl = redirectParam
            ? `/login?redirect=${encodeURIComponent(redirectParam)}`
            : "/login";
          router.replace(loginUrl);
          return;
        }
        alert(`メールの送信に失敗しました。\n${error.message}`);
      } finally {
        setSending(false);
      }
      return;
    }
    // プロバイダーから取得したメールアドレスを登録する場合
    try {
      const emailVerificationUrl = redirectParam
        ? `${window.location.origin}/login?redirect=${encodeURIComponent(redirectParam)}&emailVerified=true`
        : `${window.location.origin}/login?emailVerified=true`;

      await sendEmailVerification(user, {
        url: emailVerificationUrl,
        handleCodeInApp: false,
      });
      alert(`${emailToBeRegistered}に確認メールを送りました`);
      setEmail("");
    } catch (error) {
      alert(`メールの送信に失敗しました。\n${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      const loginUrl = redirectParam
        ? `/login?redirect=${encodeURIComponent(redirectParam)}`
        : "/login";
      router.replace(loginUrl);
    } catch (err) {
      console.error("❌ Logout failed", err);
    }
  };

  return (
    <div>
      <Header />
      <div className="relative w-full min-h-screen p-8">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex-col text-center space-y-8">
          <h1 className="text-6xl font-bold text-black drop-shadow-lg">
            メールアドレスの登録
          </h1>

          <button
            className="px-4 py-2 inline-block bg-sky-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              logout();
            }}
          >
            ログアウト
          </button>

          <p>メールアドレスの登録と確認が必要です。確認用のURLを送信します。</p>

          <form onSubmit={registerEmail}>
            <input
              className="gra-input mb-2 w-full border-2 border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-md"
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
        </div>
      </div>
    </div>
  );
}
