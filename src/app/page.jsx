"use client";

// Firebaseの認証機能から、Googleログインに必要な機能をインポート
// GoogleAuthProvider: Googleログイン用のプロバイダー。
// signInWithPopup: ポップアップ画面でログイン処理を行う関数。
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
// lib/firebase.ts で初期化した Firebase 認証オブジェクト auth をインポート。これを使ってログイン処理を実行
import { auth } from "./lib/firebase";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
// import { useRef } from "react";
import { useEffect, useState } from "react";

// GoogleAuthProvider() を使って Googleログイン用のプロバイダーを作成。
// signInWithPopup(auth, provider) で、ポップアップを表示してログインを実行。
// await を使って、ログインが完了するまで待機。
const login = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
};

const bgImages = [
  "/32997476_m.jpg",
  "/istockphoto-480432438-612x612.jpg",
  "/istockphoto-1442729474-612x612.jpg",
];

// LoginPage というReactコンポーネントを定義
// ボタンを表示して、クリックすると login 関数が呼ばれ、Googleログイン開始
export default function LoginPage() {
  // const targetRef = useRef(null);

  // // ボタンを押したら target の class を切り替える処理
  // const handleToggle = () => {
  //   if (targetRef.current) {
  //     targetRef.current.classList.toggle("invisible");
  //     targetRef.current.classList.toggle("opacity-0");
  //   }
  // };
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000); // 5秒ごとに切り替え

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Header />

      <div
        className="relative w-full min-h-screen p-8"
        // style={{
        //   backgroundImage: `url(${bgImages[bgIndex]})`,
        //   opacity: fade ? 1 : 0,
        // }}
      >
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
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 flex-col items-center justify-center text-center space-y-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            食卓で家族は繋がる!!!
          </h1>

          <button
            className="px-4 py-2 inline-block bg-blue-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            onClick={() => {
              login();
            }}
          >
            Googleでログイン
          </button>

          <h1 className="text-2xl font-bold tracking-widest text-white drop-shadow-lg">
            FamDishとは
          </h1>

          <p className="text-white drop-shadow-lg">
            献立を考える手間をなくしたい。食べたいものが食卓に出てくると嬉しい。食材の無駄やマンネリ化をなくしたい。そんな願いを叶えます。
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
  // return <button onClick={login}>Googleでログイン</button>;
}

// bg-[url('../../public/top.jpg

// .top-main h2 {
//   font-size: 70px;
//   font-weight: 500;
//   line-height: 1.3;
//   -webkit-font-smoothing: antialiased;
//   margin-bottom: 20px;
// }

// .top-main p {
//   font-size: 24px;
// }
