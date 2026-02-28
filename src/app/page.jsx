"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/shared/components/header";

const BG_IMAGES = [
  "/32997476_m.jpg",
  "/istockphoto-480432438-612x612.jpg",
  "/istockphoto-1442729474-612x612.jpg",
];

const SLIDE_INTERVAL_MS = 5000;

export default function HomePage() {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* 背景画像のスライドショー */}
        {BG_IMAGES.map((img, idx) => (
          <div
            key={img}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[2000ms] ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              opacity: idx === bgIndex ? 1 : 0,
              transform: idx === bgIndex ? "scale(1.05)" : "scale(1)",
              transition: "opacity 2s ease-in-out, transform 8s ease-out",
            }}
          />
        ))}

        {/* オーガニックグラデーションオーバーレイ */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                135deg,
                rgba(90, 122, 90, 0.75) 0%,
                rgba(42, 40, 37, 0.65) 50%,
                rgba(217, 112, 72, 0.70) 100%
              )
            `,
          }}
        />

        {/* メインコンテンツ */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-8 max-w-4xl mx-auto">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-medium !text-white mb-6 tracking-tight animate-fade-in-up drop-shadow-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            食卓で家族は繋がる
          </h1>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[var(--gold-400)] to-transparent mb-8 animate-fade-in stagger-1" />

          <h2
            className="text-2xl md:text-4xl font-light !text-white mb-12 tracking-wide animate-fade-in-up stagger-2 drop-shadow-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            FamDishとは
          </h2>

          <p
            className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-12 animate-fade-in-up stagger-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            献立を考える手間をなくしたい。
            <br />
            食べたいものが食卓に出てくると嬉しい。
            <br />
            食材の無駄やマンネリ化をなくしたい。
            <br />
            <span className="text-[var(--gold-400)] font-medium">
              そんな悩みを解決。
            </span>
          </p>

          <Link
            href="/sign-in"
            className="luxury-btn luxury-btn-accent text-lg px-8 py-4 animate-fade-in-up stagger-4 shadow-xl hover:shadow-2xl"
          >
            今すぐ無料で始める
          </Link>

          <p className="mt-8 text-white/80 text-sm md:text-base animate-fade-in stagger-5">
            アカウントをお持ちの方は{" "}
            <Link
              href="/login"
              className="text-[var(--gold-400)] hover:text-[var(--gold-500)] underline underline-offset-4 font-medium transition-colors"
            >
              こちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
