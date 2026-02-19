"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import { AuthHeader } from "../../../components/auth_header";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import { useSuggestion } from "@/hooks/useSuggestion";
import { useFeedback } from "@/hooks/useFeedback";
import SuggestionCard from "@/components/SuggestionCard";

export default function FamilySuggestionPage() {
  const [usertoken, setUsertoken] = useState("");
  const [pastSuggestions, setPastSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── AI提案用 ──
  const aiSuggestionsRef = useRef(null);
  const {
    loading: aiLoading,
    suggestions: aiSuggestions,
    fetchSuggestions,
  } = useSuggestion();
  const { saveFeedback } = useFeedback();

  // ── メニュー選択用 ──
  const [menuList, setMenuList] = useState([]);
  const [goodCount, setGoodCount] = useState({});
  const [selectedMenuId, setSelectedMenuId] = useState("");

  // ── 制約条件 ──
  const [servings, setServings] = useState("");
  const [budget, setBudget] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [days, setDays] = useState("");
  const [stocks, setStocks] = useState([]);

  // ── 料理担当者 ──
  const [members, setMembers] = useState([]);
  const [todayCookId, setTodayCookId] = useState(null);
  const [cookSelectMessage, setCookSelectMessage] = useState("");

  // ── 認証 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUsertoken(token);
      } else {
        setUsertoken("");
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── メンバー＆ファミリー情報取得 ──
  useEffect(() => {
    if (!auth.currentUser) return;
    const fetch = async () => {
      try {
        const membersRes = await apiClient.get("/api/members");
        setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
        const familyRes = await apiClient.get("/api/families");
        setTodayCookId(familyRes.data.today_cook_id || null);
      } catch (error) {
        console.error("ファミリー情報取得失敗:", error);
      }
    };
    fetch();
  }, []);

  // ── 在庫取得 ──
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

  // ── メニュー一覧 + good count 取得 ──
  useEffect(() => {
    if (!auth.currentUser) return;
    const loadMenus = async () => {
      try {
        const res = await apiClient.get("/api/menus");
        const menus = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];
        setMenuList(menus);

        const goodCountMap = {};
        for (const m of menus) {
          try {
            const countRes = await apiClient.get("/api/goods/count", {
              /* eslint-disable-next-line camelcase */
              params: { menu_id: m.id },
            });
            goodCountMap[m.id] = Number(countRes.data.count) || 0;
          } catch (err) {
            console.error(`good count 取得失敗 (menu_id: ${m.id}):`, err);
            goodCountMap[m.id] = 0;
          }
        }
        setGoodCount(goodCountMap);
      } catch (error) {
        console.error("メニューの取得に失敗しました:", error);
      }
    };
    loadMenus();
  }, []);

  // ── 過去の献立取得 ──
  const fetchPastSuggestions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/suggestions/check");
      setPastSuggestions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("家族の献立取得に失敗しました:", error);
      setPastSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usertoken) return;
    fetchPastSuggestions();
  }, [usertoken]);

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

  // ── 制約条件 ──
  const getConstraints = () => {
    const c = {};
    if (servings) c.servings = Number(servings);
    if (budget) c.budget = Number(budget);
    // eslint-disable-next-line camelcase
    if (cookingTime) c.cooking_time = Number(cookingTime);
    if (days) c.days = Number(days);
    return c;
  };

  // ── 提案取得 ──
  const handleFetchSuggestions = async (requests) => {
    setTimeout(() => {
      aiSuggestionsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
    try {
      await fetchSuggestions(requests, undefined, getConstraints());
    } catch (error) {
      if (error.status === 403) {
        alert("今日の料理担当者ではありません");
      } else {
        alert("提案取得に失敗しました");
      }
    }
  };

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1
            className="text-2xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🏠 わが家の過去の献立
          </h1>
          <p className="text-sm text-muted text-center max-w-lg">
            家族の中で過去に採用された献立の一覧です。
            <br />
            リクエストメニューを選んでAI提案を受け、「献立に追加」すると一覧に反映されます。
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/menus/familysuggestion/suggestion"
              className="luxury-btn luxury-btn-outline flex items-center gap-2"
            >
              <span>🌍</span>
              <span>みんなの献立を参考にする</span>
            </Link>
            <Link
              href="/menus"
              className="luxury-btn luxury-btn-secondary flex items-center gap-2"
            >
              <span>🍽️</span>
              <span>メニューページへ戻る</span>
            </Link>
          </div>
        </div>

        {/* ─── 料理担当者選択 ─── */}
        <div className="luxury-card max-w-2xl mx-auto mb-8">
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

        {/* ─── 制約条件設定 ─── */}
        <div className="luxury-card max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">⚙️</span>
            <h2
              className="text-xl font-medium text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              AI提案の条件設定
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="luxury-label text-sm block mb-2">
                👨‍👩‍👧‍👦 何人分
              </label>
              <select
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="luxury-select text-sm"
              >
                <option value="">指定なし</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}人分
                  </option>
                ))}
              </select>
            </div>
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
            <div>
              <label className="luxury-label text-sm block mb-2">
                ⏰ 調理時間
              </label>
              <select
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                className="luxury-select text-sm"
              >
                <option value="">指定なし</option>
                {[10, 15, 20, 30, 45, 60, 90, 120].map((n) => (
                  <option key={n} value={n}>
                    {n}分以内
                  </option>
                ))}
              </select>
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
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--sage-50)] text-[var(--sage-600)] border border-[var(--sage-200)]"
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

        {/* ────── メニュー選択と提案取得 ────── */}
        <div className="luxury-card max-w-2xl mx-auto mb-8">
          <label className="luxury-label text-center block mb-4">
            【提案を取得したいメニューを選択】
          </label>
          <div className="space-y-4">
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="luxury-select"
            >
              <option value="">─── メニューを選択 ───</option>
              {menuList.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name} ❤️{goodCount[menu.id] || 0}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (selectedMenuId) {
                  const id = Number(selectedMenuId);
                  if (!Number.isNaN(id)) {
                    const selectedMenu = menuList.find((m) => m.id === id);
                    if (selectedMenu) {
                      /* eslint-disable-next-line camelcase */
                      handleFetchSuggestions({ menu_id: id });
                    }
                  }
                } else {
                  handleFetchSuggestions({});
                }
              }}
              className="luxury-btn luxury-btn-primary w-full"
            >
              {selectedMenuId
                ? "提案を取得"
                : "今ある在庫から家族の好みを元に提案"}
            </button>
          </div>
          <p className="text-sm text-muted text-center mt-4">
            リクエストの編集・削除は
            <Link href="/request" className="text-[var(--primary)] underline">
              リクエスト管理ページ
            </Link>
            で行えます。
          </p>
        </div>

        {/* ── AI提案結果 ── */}
        {aiLoading && <LoadingSpinner />}

        <div ref={aiSuggestionsRef}>
          {aiSuggestions && (
            <div className="mt-4 grid gap-4 max-w-2xl mx-auto mb-12">
              <SuggestionCard
                suggestion={aiSuggestions.suggest_field}
                onOk={async () => {
                  await saveFeedback(aiSuggestions.id, "ok", "");
                  alert("献立に追加しました！");
                  // 過去の献立一覧をリロードして即反映
                  await fetchPastSuggestions();
                }}
                onRetry={async () => {
                  await saveFeedback(aiSuggestions.id, "alt", "");
                  alert("別案を要求しました");
                  const sf = aiSuggestions.suggest_field;
                  const reqs = Array.isArray(sf)
                    ? sf[0]?.requests
                    : sf.requests;
                  fetchSuggestions(reqs, aiSuggestions.id, getConstraints());
                }}
                onNg={async () => {
                  const reason = prompt("NG 理由を入力してください（任意）:");
                  await saveFeedback(aiSuggestions.id, "ng", reason || "");
                  alert("NG理由を送信しました");
                  const sf = aiSuggestions.suggest_field;
                  const reqs = Array.isArray(sf)
                    ? sf[0]?.requests
                    : sf.requests;
                  fetchSuggestions(reqs, aiSuggestions.id, getConstraints());
                }}
              />
            </div>
          )}
        </div>

        {/* ─── 過去の献立一覧 ─── */}
        <h2
          className="text-xl font-medium text-[var(--foreground)] text-center mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          📜 過去に採用された献立
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : pastSuggestions.length === 0 ? (
          <div className="luxury-card max-w-xl mx-auto text-center py-8 mb-12">
            <p className="text-muted text-lg">まだ採用された献立がありません</p>
            <p className="text-sm text-muted mt-2">
              上のボタンからAI提案を受けて、「献立に追加」を押すとここに表示されます。
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-4 mb-12">
            {pastSuggestions.map((s) => (
              <div key={s.id} className="luxury-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">
                      🍽️ {s.ai_raw_json?.title || "タイトルなし"}
                    </h3>
                    <p className="text-sm text-[var(--primary)] mt-1">
                      リクエスト：{s.requests}
                    </p>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                {s.ai_raw_json?.reason && (
                  <p className="text-sm text-muted mt-3">
                    💡 {s.ai_raw_json.reason}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted">
                  {s.ai_raw_json?.time && (
                    <span>⏱️ {s.ai_raw_json.time}分</span>
                  )}
                  {s.ai_raw_json?.ingredients && (
                    <span>🥗 {s.ai_raw_json.ingredients.join("・")}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 mb-12 justify-center">
          <Link href="/menus" className="luxury-btn luxury-btn-secondary">
            メニューページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
