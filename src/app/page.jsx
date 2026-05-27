"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Header } from "@/shared/components/header";
import { apiClient } from "@/shared/lib/api";
import { HeroSuggestionCard } from "@/features/menu/components/HeroSuggestionCard";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { auth } from "@/shared/lib/firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

const BG_IMAGES = [
  "/32997476_m.jpg",
  "/istockphoto-480432438-612x612.jpg",
  "/istockphoto-1442729474-612x612.jpg",
];

const SLIDE_INTERVAL_MS = 5000;

function MenuContent({ item }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🍽️</span>
        <h2
          className="text-2xl font-medium text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {item.title}
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <span className="luxury-label text-base block mb-2">選んだ理由</span>
          <p className="text-muted leading-relaxed">{item.reason}</p>
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <span className="luxury-label text-base block mb-2">調理時間</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-medium text-[var(--primary)]">
                {item.time}
              </span>
              <span className="text-muted">分</span>
            </div>
          </div>
          <div>
            <span className="luxury-label text-base block mb-2">予算</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-medium text-[var(--secondary)]">
                {item.budget.toLocaleString()}
              </span>
              <span className="text-muted">円</span>
            </div>
          </div>
        </div>

        <div>
          <span className="luxury-label text-base block mb-2">材料</span>
          <div className="flex flex-wrap gap-2">
            {item.ingredients.map((ingredient, i) => (
              <span key={i} className="luxury-badge">
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const TRIAL_LIMIT = 2;
const TRIAL_COUNT_KEY = "famdish_trial_count";

export default function HomePage() {
  const suggestionsRef = useRef(null);

  // ── state ──
  const [suggestions, setSuggestions] = useState([]);
  const [bgIndex, setBgIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [like, setLike] = useState("");
  const [dislike, setDislike] = useState("");
  const [aisuggestion, setAiSuggestion] = useState();
  const [trialCount, setTrialCount] = useState(0);
  const [showLimitBanner, setShowLimitBanner] = useState(false);

  // ── 匿名認証 & 試用回数の読み込み ──
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("[Anonymous Auth] サインイン失敗:", e);
        }
      } else {
        // 匿名ユーザーかどうか（将来の昇格処理のために保持可能）
        void user.isAnonymous;
      }
    });
    return () => unsubscribe();
  }, []);

  // ── localStorage から試用回数を初期化 ──
  useEffect(() => {
    const stored = parseInt(localStorage.getItem(TRIAL_COUNT_KEY) || "0", 10);
    setTrialCount(stored);
    if (stored >= TRIAL_LIMIT) setShowLimitBanner(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const handleTrialAiSuggesttion = () => {
    setTimeout(() => {
      suggestionsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const trySuggestions = async () => {
    // 試用回数チェック
    const current = parseInt(localStorage.getItem(TRIAL_COUNT_KEY) || "0", 10);
    if (current >= TRIAL_LIMIT) {
      setShowLimitBanner(true);
      return;
    }

    setLoading(true);
    // ToDo バックエンドにAI提案を試すAPIを実装する
    try {
      const res = await apiClient.post("/api/trial/aisuggestion", {
        likes: like,
        dislikes: dislike,
      });
      setAiSuggestion(res.data?.sample);

      // 成功したら試用回数をインクリメント
      const next = current + 1;
      localStorage.setItem(TRIAL_COUNT_KEY, String(next));
      setTrialCount(next);
      if (next >= TRIAL_LIMIT) setShowLimitBanner(true);
    } catch (error) {
      console.error("AI提案取得失敗:", error);
      alert("AI提案取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        const [recipesRes] = await Promise.all([apiClient.get("/api/recipes")]);

        const suggestionsData = Array.isArray(recipesRes.data)
          ? recipesRes.data
          : [];
        setSuggestions(suggestionsData);
      } catch (error) {
        console.error("初期データ取得失敗:", error);
        setSuggestions([]);
      }
    };
    fetchDemoData();
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
            className="text-4xl md:text-6xl lg:text-7xl font-medium !text-red-500 mb-6 tracking-tight animate-fade-in-up drop-shadow-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            30秒であなた向けの献立を提案
          </h1>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[var(--gold-400)] to-transparent mb-8 animate-fade-in stagger-1" />

          <h2
            className="text-2xl md:text-4xl font-light !text-white mb-24 tracking-wide animate-fade-in-up stagger-2 drop-shadow-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            好きなものと嫌いなものを選んで、
            <br />
            冷蔵庫の在庫を登録するだけ
          </h2>

          <h2
            className="text-2xl md:text-4xl font-light mb-12 tracking-wide animate-fade-in-up stagger-2 animate-color-alternate drop-shadow-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            AIがパーソナライズした献立を自動提案します
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={handleTrialAiSuggesttion}
              className="luxury-btn luxury-btn-accent text-lg px-8 py-4 animate-fade-in-up stagger-4 shadow-xl hover:shadow-2xl"
            >
              今すぐ無料で試す
            </button>

            <button className="luxury-btn luxury-btn-accent text-lg px-8 py-4 animate-fade-in-up stagger-4 shadow-xl hover:shadow-2xl">
              デモを見る
            </button>
          </div>

          <p
            className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-12 animate-fade-in-up stagger-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            実際の生成例
          </p>

          <div className="w-full max-w-2xl flex flex-col gap-4">
            {suggestions.map((s) => (
              <HeroSuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>

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

          {/* ─── 提案取得ボタン ─── */}
          <div>
            <label>好きなもの</label>
            <input
              type="text"
              onChange={(e) => setLike(e.target.value)}
              className="luxury-input"
            />
          </div>
          <div>
            <label>嫌いなもの</label>
            <input
              type="text"
              onChange={(e) => setDislike(e.target.value)}
              className="luxury-input"
            />
          </div>

          {/* ─── 試用回数バッジ ─── */}
          {trialCount < TRIAL_LIMIT && (
            <p className="text-white/80 text-sm mb-2">
              お試し残り{" "}
              <span className="text-[var(--gold-400)] font-bold">
                {TRIAL_LIMIT - trialCount}
              </span>{" "}
              回
            </p>
          )}

          <div className="luxury-card max-w-2xl mx-auto mb-12">
            <button
              onClick={trySuggestions}
              disabled={trialCount >= TRIAL_LIMIT}
              className="luxury-btn luxury-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              献立提案を試してみる
            </button>
          </div>

          {/* ─── 試用回数上限バナー ─── */}
          {showLimitBanner && (
            <div className="w-full max-w-2xl mb-8 rounded-2xl border border-[var(--gold-400)] bg-black/50 backdrop-blur-sm p-6 text-center animate-fade-in">
              <p className="text-[var(--gold-400)] text-lg font-medium mb-2">
                🎉 お試し提案を{TRIAL_LIMIT}回使い切りました！
              </p>
              <p className="text-white/80 text-sm mb-5">
                本登録すると無制限で献立提案・在庫管理・家族共有が使えます。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/sign-in"
                  className="luxury-btn luxury-btn-accent px-6 py-3"
                >
                  無料で本登録する
                </Link>
                <Link
                  href="/login"
                  className="luxury-btn luxury-btn-outline px-6 py-3 !text-white !border-white/50"
                >
                  ログイン
                </Link>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4 my-8">
              <LoadingSpinner />
              <p className="text-sm text-muted animate-pulse">
                AIが献立を考えています…（最大2分ほどかかる場合があります）
              </p>
            </div>
          )}

          <div>
            {aisuggestion && (
              <div className="mt-4 grid gap-4">
                <MenuContent item={aisuggestion} />
              </div>
            )}
          </div>

          <Link
            href="/sign-in"
            className="luxury-btn luxury-btn-accent text-lg px-8 py-4 animate-fade-in-up stagger-4 shadow-xl hover:shadow-2xl"
            ref={suggestionsRef}
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
