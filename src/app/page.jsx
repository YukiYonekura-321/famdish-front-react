"use client";

import {
  onAuthStateChanged,
  isSignInWithEmailLink,
  signOut,
  verifyBeforeUpdateEmail,
  reauthenticateWithPopup,
} from "firebase/auth";
import { getProvider } from "@/app/lib/provider-utils";
import { auth } from "@/app/lib/firebase";
import { handleEmailSignIn } from "@/app/lib/email-signin";
import { deleteUser } from "@/app/lib/delete-user";
import { ProviderLinkTable } from "@/components/ProviderLinkTable";
import { useRouter } from "next/navigation";
import { Header } from "../components/header";
import { useEffect, useState } from "react";

const bgImages = [
  "/32997476_m.jpg",
  "/istockphoto-480432438-612x612.jpg",
  "/istockphoto-1442729474-612x612.jpg",
];

export default function LootPage() {
  const router = useRouter();
  const [bgIndex, setBgIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authUser, setauthUser] = useState(null);

  useEffect(() => {
    const runEmailLikSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        await handleEmailSignIn();
      }
    };

    runEmailLikSignIn();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setauthUser(user);
        console.log(`authCurrentUser->${user}`);
        if (!user.emailVerified) {
          router.replace("/register-email");
          return;
        }
        setEmail(user.email || "");
        setDisplayName(user.displayName);
        console.log(user);
      } else {
        router.replace("/login");
        return;
      }
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000); // 5秒ごとに切り替え

    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      console.error("❌ Logout failed", err);
    }
  };

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
    <div>
      <Header />

      <div className="relative w-full min-h-screen p-8">
        {/* 背景画像3枚重ねる 画像を重ねないと文字も消えてしまう */}
        {bgImages.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-3000"
            style={{
              backgroundImage: `url(${img})`,
              opacity: idx === bgIndex ? 1 : 0,
            }}
          ></div>
        ))}
        {/* マスク（暗くする） */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex-col text-center space-y-8">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">
            食卓で家族は繋がる
          </h1>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            {displayName}さんでログイン中です
          </h1>
          <p className="text-white inline-block w-1/2 text-center drop-shadow-lg">
            メールアドレス
          </p>
          <p className="text-white inline-block w-1/2 text-center drop-shadow-lg">
            現在のメールアドレス{email}
          </p>
          <button
            className="px-4 py-2 inline-block bg-blue-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              logout();
            }}
          >
            ログアウト
          </button>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            連携状態
          </h2>
          {authUser && <ProviderLinkTable user={authUser} />}
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
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">退会</h2>
          <p>メールアドレス、連携状態が破棄されます</p>
          <button
            className="px-4 py-2 inline-block bg-sky-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              deleteUser();
            }}
          >
            退会
          </button>
        </div>
      </div>
    </div>
  );
}
