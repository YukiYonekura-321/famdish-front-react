"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { onAuthStateChanged, isSignInWithEmailLink } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/shared/lib/api";
import { auth } from "@/shared/lib/firebase";
import { handleEmailSignIn } from "@/features/auth/lib/email-signin";
import { useSuggestion } from "@/features/menu/hooks/useSuggestion";
import { useFeedback } from "@/features/menu/hooks/useFeedback";
import SuggestionCard from "@/features/menu/components/SuggestionCard";
import { AuthHeader } from "@/shared/components/auth_header";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import {
  BUDGET_OPTIONS,
  COOKING_TIME_OPTIONS,
  DAYS_OPTIONS,
  MENU_NAV_LINKS,
} from "@/features/menu/constants";
import { ConstraintToggle } from "@/features/menu/components/ConstraintToggle";
import { StockBadges } from "@/features/menu/components/StockBadges";

// ── メインコンポーネント ──

export default function MenuPage() {
  const router = useRouter();
  const suggestionsRef = useRef(null);

  // ── hooks ──
  const { loading, suggestions, fetchSuggestions } = useSuggestion();
  const { saveFeedback } = useFeedback();

  // ── state ──
  const [constraintType, setConstraintType] = useState("budget");
  const [budget, setBudget] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [days, setDays] = useState("");
  const [stocks, setStocks] = useState([]);
  const [members, setMembers] = useState([]);
  const [todayCookId, setTodayCookId] = useState(null);
  const [cookSelectMessage, setCookSelectMessage] = useState("");
  const [myMemberId, setMyMemberId] = useState(null);

  // ── 認証 ──
  useEffect(() => {
    let unsubscribe;
    const runEmailSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          await handleEmailSignIn();
        } catch (e) {
          console.error("Email sign in failed:", e);
        }
        return;
      }
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) router.replace("/login");
      });
    };
    runEmailSignIn();
    return () => unsubscribe?.();
  }, [router]);

  // ── 初期データ取得（メンバー・ファミリー・在庫を一括） ──
  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchInitialData = async () => {
      try {
        const [membersRes, meRes, familyRes, stocksRes] = await Promise.all([
          apiClient.get("/api/members"),
          apiClient.get("/api/members/me"),
          apiClient.get("/api/families"),
          apiClient.get("/api/stocks"),
        ]);
        setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
        setMyMemberId(meRes.data?.member?.id || meRes.data?.id || null);
        setTodayCookId(familyRes.data?.today_cook_id || null);
        setStocks(stocksRes.data || []);
      } catch (error) {
        console.error("初期データ取得失敗:", error);
      }
    };
    fetchInitialData();
  }, []);

  // ── 料理担当者選択 ──
  const handleSelectCook = useCallback(async (memberId) => {
    try {
      setCookSelectMessage("");

      await apiClient.post("/api/families/assign_cook", {
        member_id: memberId,
      });
      setTodayCookId(memberId);
      setCookSelectMessage(
        "料理担当者を設定しました（提案ボタンは担当者のみ有効です）",
      );
      setTimeout(() => setCookSelectMessage(""), 3000);
    } catch (error) {
      console.error("料理担当者設定失敗:", error);
      setCookSelectMessage("料理担当者の設定に失敗しました");
    }
  }, []);

  // ── 制約条件をまとめる（予算 or 調理時間は排他） ──
  const getConstraints = useCallback(() => {
    const c = {};
    if (days) c.days = Number(days);
    if (constraintType === "budget" && budget) {
      c.budget = Number(budget);
    } else if (constraintType === "time" && cookingTime) {
      c.cooking_time = Number(cookingTime); // eslint-disable-line camelcase
    }
    return c;
  }, [days, constraintType, budget, cookingTime]);

  // ── 制約タイプ切替ハンドラ ──
  const handleConstraintTypeChange = useCallback((type) => {
    setConstraintType(type);
    if (type === "budget") setCookingTime("");
    else setBudget("");
  }, []);

  // ── 献立提案 ──
  const handleFetchSuggestions = useCallback(async () => {
    setTimeout(() => {
      suggestionsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
    try {
      await fetchSuggestions(undefined, undefined, getConstraints());
    } catch (error) {
      if (error.status === 403) {
        alert("料理担当者ではありません。料理担当者を変更してください。");
      } else {
        alert(`提案取得に失敗しました: ${error.message}`);
      }
    }
  }, [fetchSuggestions, getConstraints]);

  // ── 提案を採用（レシピ登録 → 遷移） ──
  const handleAcceptSuggestion = useCallback(async () => {
    if (!todayCookId) {
      alert("料理担当者が設定されていません。料理担当者を設定してください。");
      return;
    }
    if (myMemberId && todayCookId !== myMemberId) {
      const cookName =
        members.find((m) => m.id === todayCookId)?.name || "別のメンバー";
      alert(
        `献立一覧に加えられるのは本日の料理担当者（${cookName}）のみです。`,
      );
      return;
    }

    await saveFeedback(suggestions.id, "ok", "");
    alert("採用しました");

    const field = suggestions.suggest_field;
    const items = Array.isArray(field) ? field : [field];
    for (const item of items) {
      if (!item?.title) continue;
      try {
        /* eslint-disable camelcase */
        await apiClient.post("/api/recipes", {
          dish_name: item.title,
          reason: item.reason,
          proposer: todayCookId,
        });
        /* eslint-enable camelcase */
      } catch (err) {
        console.warn(
          `Recipe登録スキップ (${item.title}):`,
          err?.response?.status,
        );
      }
    }
    router.push("/menus/familysuggestion");
  }, [todayCookId, myMemberId, members, suggestions, saveFeedback, router]);

  // ── 別案要求 ──
  const handleRetry = useCallback(async () => {
    await saveFeedback(suggestions.id, "alt", "");
    alert("別案を要求しました");
    fetchSuggestions(undefined, suggestions.id, getConstraints());
  }, [suggestions, saveFeedback, fetchSuggestions, getConstraints]);

  // ── NG送信 ──
  const handleNg = useCallback(async () => {
    const reason = prompt("NG 理由を入力してください（任意）:");
    await saveFeedback(suggestions.id, "ng", reason || "");
    alert("NG理由を送信しました");
    fetchSuggestions(undefined, suggestions.id, getConstraints());
  }, [suggestions, saveFeedback, fetchSuggestions, getConstraints]);

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8">
        {/* ─── ナビゲーション ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {MENU_NAV_LINKS.map(({ href, icon, label, variant }) => (
            <Link
              key={href}
              href={href}
              className={`luxury-btn luxury-btn-${variant} flex items-center gap-2`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* ─── 制約条件設定 ─── */}
        <div className="luxury-card max-w-2xl mx-auto mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">⚙️</span>
            <h2
              className="text-xl font-medium text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              AI提案の条件設定
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="luxury-label text-sm block mb-3">
                🎯 こだわり条件（どちらか一方を選択）
              </label>
              <ConstraintToggle
                constraintType={constraintType}
                onSelect={handleConstraintTypeChange}
              />

              {constraintType === "budget" ? (
                <div>
                  <label className="luxury-label text-sm block mb-2">
                    💰 希望予算
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="luxury-select text-sm"
                  >
                    <option value="">指定なし</option>
                    {BUDGET_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n.toLocaleString()}円以内
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="luxury-label text-sm block mb-2">
                    ⏱️ 希望調理時間
                  </label>
                  <select
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.target.value)}
                    className="luxury-select text-sm"
                  >
                    <option value="">指定なし</option>
                    {COOKING_TIME_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}分以内
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="luxury-label text-sm block mb-2">
                📅 提案期間
              </label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="luxury-select text-sm"
              >
                <option value="">1日分</option>
                {DAYS_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}日分まとめて
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 冷蔵庫の在庫表示 */}
          <div className="border-t border-[var(--border)] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🧊</span>
              <span
                className="text-sm font-medium text-[var(--warm-gray-600)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                冷蔵庫の在庫（AIが自動で考慮します）
              </span>
            </div>
            <StockBadges stocks={stocks} />
          </div>
        </div>

        {/* ─── 料理担当者選択 ─── */}
        <div className="luxury-card max-w-2xl mx-auto mb-12">
          <label className="luxury-label text-center block mb-4">
            今日の料理担当者
          </label>
          <select
            value={todayCookId || ""}
            onChange={(e) => handleSelectCook(Number(e.target.value) || null)}
            className="luxury-select"
          >
            <option value="">選択してください</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {cookSelectMessage && (
            <p className="text-sm text-[var(--primary)] mt-3 text-center">
              {cookSelectMessage}
            </p>
          )}
        </div>

        {/* ─── 提案取得ボタン ─── */}
        <div className="luxury-card max-w-2xl mx-auto mb-12">
          <button
            onClick={handleFetchSuggestions}
            className="luxury-btn luxury-btn-primary w-full"
          >
            今ある在庫から家族の好みを元に提案
          </button>
        </div>

        {loading && <LoadingSpinner />}

        <div ref={suggestionsRef}>
          {suggestions && (
            <div className="mt-4 grid gap-4">
              <SuggestionCard
                suggestion={suggestions.suggest_field}
                onOk={handleAcceptSuggestion}
                onRetry={handleRetry}
                onNg={handleNg}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
