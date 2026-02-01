"use client";

import { Header } from "../components/header";
import { useEffect, useState } from "react";
import Link from "next/link";

const bgImages = [
  "/32997476_m.jpg",
  "/istockphoto-480432438-612x612.jpg",
  "/istockphoto-1442729474-612x612.jpg",
];

export default function LootPage() {
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

          <h1 className="text-white text-2xl md:text-5xl font-bold tracking-widest drop-shadow-lg">
            FamDishとは
          </h1>

          <p className="text-white inline-block text-center drop-shadow-lg">
            献立を考える手間をなくしたい。食べたいものが食卓に出てくると嬉しい。食材の無駄やマンネリ化をなくしたい。
          </p>

          <p className="text-white inline-block text-center drop-shadow-lg">
            そんな願いを叶えます。
          </p>

          <Link
            className="px-4 py-2 inline-block bg-green-500 text-white opacity-80 hover:opacity-100 transition duration-1000 rounded-md"
            href="/sign-in"
          >
            今すぐ無料で始める
          </Link>

          <p className="mt-6 text-white text-sm">
            アカウントをお持ちの方は{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:opacity-80 transition"
            >
              こちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
