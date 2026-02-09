"use client";

import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  //   signInWithRedirect,
  signInWithPopup,
  //   getRedirectResult,
  //   onAuthStateChanged,
  getAdditionalUserInfo,
} from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/app/lib/api";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import Link from "next/link";

// リダイレクト先がアプリ内の安全なパスか検証
const isValidRedirectPath = (path) => {
  if (!path) return false;
  // 外部 URL や プロトコル付きは拒否
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//")
  ) {
    return false;
  }
  // アプリ内パス（/で始まる）のみ許可
  return path.startsWith("/");
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const redirectTomyPageWhenLoginSuccess = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const additional = getAdditionalUserInfo(result); // 正規の取得方法
      console.log("additionalUserInfo:", additional);
      const isNewUser = additional?.isNewUser;

      // リダイレクト先を決定（redirect param があれば優先）
      let targetPath = "/menus";

      if (isNewUser) {
        // 新規登録ユーザーはプロフィールステップへ
        targetPath = "/profile/step1";
      } else {
        // isNewUser = falseの場合でも、本登録状況を確認する
        // サーバ側で member が紐付いていれば本登録とみなし /menus へリダイレクト
        try {
          const res = await apiClient.get("/api/members/me");
          if (res?.data?.username) {
            // 本登録済み
            targetPath = "/menus";
          } else {
            targetPath = "/profile/step1";
          }
        } catch (err) {
          console.error("member/me check failed", err);
          targetPath = "/profile/step1";
        }
      }

      // メールが確認されていない場合はメール登録画面に遷移する
      if (!result.user.emailVerified) {
        targetPath = "/register-email";
      }

      // redirect クエリパラメータがあり、かつ安全なパスなら優先
      if (isValidRedirectPath(redirectParam)) {
        targetPath = redirectParam;
      }

      router.replace(targetPath);
    } catch (error) {
      console.log(error);
      console.log(
        error.code,
        error.message,
        error.credential,
        error.customData,
      );
      alert(`エラー: ${error.code} ${error.message}`);
      if (error.code === "auth/account-exists-with-different-credential") {
        alert(
          `${error.customData.email}は他のSNSと連携した既存ユーザーが登録済みです。既存ユーザーでログイン後、こちらのSNSとの連携が可能です。`,
        );
        return;
      }
      alert(`ログイン/新規登録に失敗しました。\n${error.message}`);
    }
  };

  // Googleログインボタン
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await redirectTomyPageWhenLoginSuccess(provider);
  };

  // X(twitter)ログインボタン
  const twitterLogin = async () => {
    const provider = new TwitterAuthProvider();
    await redirectTomyPageWhenLoginSuccess(provider);
  };

  // GitHubログインボタン
  const githubLogin = async () => {
    const provider = new GithubAuthProvider();
    await redirectTomyPageWhenLoginSuccess(provider);
  };
  //   useEffect(() => {
  //     redirect 結果の取得
  //     getRedirectResult(auth)
  //       .then((result) => {
  //         console.log("getRedirectResult ->", result);
  //         if (result?.user) {
  //           console.log("✅ Redirect login success:", result.user);
  //           // ログイン成功 → ページ遷移
  //           router.replace("/members"); // 遷移先を適宜変更
  //         } else {
  //           console.log("ℹ️ No redirect result");
  //         }
  //       })
  //       .catch((err) => console.error("❌ Redirect error", err));
  //     const unsub = onAuthStateChanged(auth, (u) =>
  //       console.log("onAuthStateChanged ->", u),
  //     );
  //     console.log("auth redirectUser:", auth.redirectUser);
  //     console.log(
  //       "localStorage redirect key:",
  //       localStorage.getItem(
  //         "firebase:redirectUser:AIzaSyAmSNvwCiw2fNXzH_yRzbxmb3bNpnHmeJQ:[DEFAULT]",
  //       ),
  //     );
  //     console.log(
  //       "localStorage auth key:",
  //       localStorage.getItem(
  //         "firebase:authUser:AIzaSyAmSNvwCiw2fNXzH_yRzbxmb3bNpnHmeJQ:[DEFAULT]",
  //       ),
  //     );
  //     return () => unsub();
  //   }, [router]);

  return (
    <div>
      <Header />

      <div className="relative w-full min-h-screen p-8">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex flex-col items-centertext-center space-y-8">
          <h1 className="text-3xl md:text-6xl font-bold text-black drop-shadow-lg">
            ログイン
          </h1>

          <button
            className="px-4 py-2 inline-block bg-blue-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              googleLogin();
            }}
          >
            Googleでログイン
          </button>

          <button
            className="px-4 py-2 inline-block bg-sky-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              twitterLogin();
            }}
          >
            X(Twitter)でログイン
          </button>

          <button
            className="px-4 py-2 inline-block bg-gray-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              githubLogin();
            }}
          >
            Githubでログイン
          </button>

          <Link href={"/recovery"}>
            <p className="md:text-xl underline underline-offset-4 hover:opacity-80 transition">
              ソーシャルログインできない場合はここから
            </p>
          </Link>

          <p className="md:text-3xl mt-6 text-sm">
            アカウントをお持ちでない方
            <br />
            <Link
              href="/sign-in"
              className="md:text-xl underline underline-offset-4 hover:opacity-80 transition"
            >
              会員登録はこちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
