"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSuggestion } from "@/hooks/useSuggestion";
import { useFeedback } from "@/hooks/useFeedback";
import SuggestionCard from "@/components/SuggestionCard";
import { AuthHeader } from "@/components/auth_header";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { handleEmailSignIn } from "@/app/lib/email-signin";
import { isSignInWithEmailLink } from "firebase/auth";

export default function MenuPage() {
  // ── 共通 state ──
  const router = useRouter();
  const suggestionsRef = useRef(null);

  // ── 提案用 hooks ──
  const { loading, suggestions, fetchSuggestions } = useSuggestion();
  const { saveFeedback } = useFeedback();

  // ── 制約条件 state ──
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [stocks, setStocks] = useState([]);

  // ── 料理担当者関連 state ──
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
        } catch (error) {
          console.error("Email sign in failed:", error);
        }
        return; // メール処理後は早期終了
      }

      // メール処理がない場合のみ認証チェック
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.replace("/login");
        }
      });
    };

    runEmailSignIn();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  // ── メンバー一覧とファミリー情報取得 ──
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchFamilyInfo = async () => {
      try {
        // メンバー一覧取得
        const membersRes = await apiClient.get("/api/members");
        const membersList = Array.isArray(membersRes.data)
          ? membersRes.data
          : [];
        setMembers(membersList);

        // ログインユーザーのmember_id取得
        const meRes = await apiClient.get("/api/members/me");
        setMyMemberId(meRes.data?.member?.id || meRes.data?.id || null);

        // ファミリー情報取得（today_cook_id）
        const familyRes = await apiClient.get("/api/families");
        const familyData = familyRes.data;
        setTodayCookId(familyData.today_cook_id || null);
      } catch (error) {
        console.error("ファミリー情報取得失敗:", error);
      }
    };

    fetchFamilyInfo();
  }, []);

  // ── 在庫データ取得 ──
  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchStocks = async () => {
      try {
        const res = await apiClient.get("/api/stocks");
        setStocks(res.data || []);
      } catch (e) {
        console.error("在庫取得失敗:", e);
        setStocks([]);
      }
    };
    fetchStocks();
  }, []);

  // ── メニュー作成 / ハート（good）トグル ──
  // 削除済み - /request ページへ移行

  // ── 料理担当者選択 ──
  const handleSelectCook = async (memberId) => {
    try {
      setCookSelectMessage("");
      await apiClient.post("/api/families/assign_cook", {
        /* eslint-disable-next-line camelcase */
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
  };

  // ── 制約条件をまとめる ──
  const getConstraints = () => {
    const c = {};
    if (budget) c.budget = Number(budget);
    if (days) c.days = Number(days);
    return c;
  };

  // ── 献立提案（提案ボタン）──
  // `requests` can be either a string (menu name) or an object (e.g. { menu_id })
  const handleFetchSuggestions = async () => {
    // スクロールして提案セクションまで移動
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
        console.error("提案取得エラー:", error);
        alert(`提案取得に失敗しました: ${error.message}`);
      }
    }
  };

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8">
        {/* ─── 過去の献立リンク ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/menus/familysuggestion"
            className="luxury-btn luxury-btn-secondary flex items-center gap-2"
          >
            <span>🏠</span>
            <span>わが家の献立</span>
          </Link>
          <Link
            href="/menus/familysuggestion/suggestion"
            className="luxury-btn luxury-btn-outline flex items-center gap-2"
          >
            <span>🌍</span>
            <span>みんなの献立を参考にする</span>
          </Link>
          <Link
            href="/request"
            className="luxury-btn luxury-btn-secondary flex items-center gap-2"
          >
            <span>📝</span>
            <span>リクエスト管理</span>
          </Link>
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

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* 希望予算 */}
            <div>
              <label className="luxury-label text-sm block mb-2">💰 予算</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="luxury-select text-sm"
              >
                <option value="">指定なし</option>
                {[300, 500, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000].map(
                  (n) => (
                    <option key={n} value={n}>
                      {n.toLocaleString()}円以内
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* 何日分提案するか */}
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
                {[2, 3, 4, 5, 6, 7].map((n) => (
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
            {stocks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stocks.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                             bg-[var(--sage-50)] text-[var(--sage-600)] border border-[var(--sage-200)]"
                  >
                    {s.name}
                    <span className="text-[var(--sage-400)]">
                      {s.quantity}
                      {s.unit}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                在庫が登録されていません。
                <a
                  href="/stock"
                  className="text-[var(--primary)] underline ml-1"
                >
                  冷蔵庫ページで登録する
                </a>
              </p>
            )}
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

        {/* ────── 【在庫ベースの提案取得】────── */}
        <div className="luxury-card max-w-2xl mx-auto mb-12">
          <button
            onClick={() => handleFetchSuggestions()}
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
                onOk={async () => {
                  // ── 料理担当者チェック ──
                  if (!todayCookId) {
                    alert(
                      "料理担当者が設定されていません。料理担当者を設定してください。",
                    );
                    return;
                  }
                  if (myMemberId && todayCookId !== myMemberId) {
                    const cookName =
                      members.find((m) => m.id === todayCookId)?.name ||
                      "別のメンバー";
                    alert(
                      `献立一覧に加えられるのは本日の料理担当者（${cookName}）のみです。`,
                    );
                    return;
                  }

                  await saveFeedback(suggestions.id, "ok", "");
                  alert("採用しました");

                  // Recipeモデルに登録（1日分: オブジェクト / 2日分以上: 配列）
                  const field = suggestions.suggest_field;
                  const items = Array.isArray(field) ? field : [field];
                  for (const item of items) {
                    const title = item?.title;
                    const reason = item?.reason;
                    if (!title) continue;
                    try {
                      /* eslint-disable camelcase */
                      await apiClient.post("/api/recipe/save_recipe", {
                        dish_name: title,
                        reason: reason,
                      });
                      /* eslint-enable camelcase */
                    } catch (err) {
                      console.warn(
                        `Recipe登録スキップ (${title}):`,
                        err?.response?.status,
                      );
                    }
                  }

                  router.push("/menus/familysuggestion");
                }}
                onRetry={async () => {
                  await saveFeedback(suggestions.id, "alt", "");
                  alert("別案を要求しました");
                  fetchSuggestions(undefined, suggestions.id, getConstraints());
                }}
                onNg={async () => {
                  const reason = prompt("NG 理由を入力してください（任意）:");
                  await saveFeedback(suggestions.id, "ng", reason || "");
                  alert("NG理由を送信しました");
                  fetchSuggestions(undefined, suggestions.id, getConstraints());
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
