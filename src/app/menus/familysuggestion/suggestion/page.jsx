"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/shared/lib/api";
import { auth } from "@/shared/lib/firebase";
import { AuthHeader } from "@/shared/components/auth_header";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { PublicSuggestionCard } from "@/features/menu/components/PublicSuggestionCard";

// ── メインコンポーネント ──

export default function AllSuggestionsPage() {
  const router = useRouter();

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goodStatus, setGoodStatus] = useState({});
  const [goodCount, setGoodCount] = useState({});
  const [members, setMembers] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);

  // ── 認証 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── 初期データ取得（メンバー・献立・goodステータスを一括） ──
  useEffect(() => {
    if (!authenticated) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [membersRes, recipesRes] = await Promise.all([
          apiClient.get("/api/members/all"),
          apiClient.get("/api/recipes"),
        ]);

        setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);

        const suggestionsData = Array.isArray(recipesRes.data)
          ? recipesRes.data
          : [];
        setSuggestions(suggestionsData);
        setLoading(false);

        // good ステータスと count をバックグラウンドで並列取得し、順次反映
        const promises = suggestionsData.map(async (s) => {
          /* eslint-disable camelcase */
          const [statusRes, countRes] = await Promise.allSettled([
            apiClient.get("/api/goods/check_suggestion", {
              params: { suggestion_id: s.id },
            }),
            apiClient.get("/api/goods/count_suggestion", {
              params: { suggestion_id: s.id },
            }),
          ]);
          /* eslint-enable camelcase */

          /* eslint-disable camelcase */
          const status =
            statusRes.status === "fulfilled"
              ? {
                  exists: statusRes.value.data.exists,
                  good_id: statusRes.value.data.good?.id || null,
                }
              : { exists: false, good_id: null };
          /* eslint-enable camelcase */

          const count =
            countRes.status === "fulfilled"
              ? Number(countRes.value.data.count) || 0
              : 0;

          setGoodStatus((prev) => ({ ...prev, [s.id]: status }));
          setGoodCount((prev) => ({ ...prev, [s.id]: count }));
        });

        await Promise.allSettled(promises);
      } catch (error) {
        console.error("初期データ取得失敗:", error);
        setSuggestions([]);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [authenticated]);

  // ── いいね（good）トグル ──
  const handleToggleGood = useCallback(
    async (suggestionId) => {
      try {
        if (goodStatus[suggestionId]?.exists) {
          const goodId = goodStatus[suggestionId].good_id;
          await apiClient.delete(`/api/goods/${goodId}/destroy_suggestion`);
          /* eslint-disable camelcase */
          setGoodStatus((prev) => ({
            ...prev,
            [suggestionId]: { exists: false, good_id: null },
          }));
          /* eslint-enable camelcase */
          setGoodCount((prev) => ({
            ...prev,
            [suggestionId]: Math.max((prev[suggestionId] || 0) - 1, 0),
          }));
        } else {
          const res = await apiClient.post("/api/goods/create_suggestion", {
            suggestion_id: suggestionId,
          });

          setGoodStatus((prev) => ({
            ...prev,
            [suggestionId]: { exists: true, good_id: res.data.id },
          }));
          setGoodCount((prev) => ({
            ...prev,
            [suggestionId]: (prev[suggestionId] || 0) + 1,
          }));
        }
      } catch (err) {
        console.error("いいね操作失敗:", err);
        alert("いいね操作に失敗しました");
      }
    },
    [goodStatus],
  );

  return (
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container mt-8 flex flex-col items-center gap-6">
        <h1
          className="text-2xl font-medium text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          🌍 みんなの献立
        </h1>

        <p className="text-sm text-muted text-center max-w-lg">
          他の家族で採用された献立も参考にできます。
          <br />
          新しいメニューのアイデアを見つけましょう！
        </p>

        <Link
          href="/menus/familysuggestion"
          className="luxury-btn luxury-btn-outline flex items-center gap-2"
        >
          <span>←</span>
          <span>わが家の献立に戻る</span>
        </Link>

        {loading ? (
          <LoadingSpinner />
        ) : suggestions.length === 0 ? (
          <div className="luxury-card w-full max-w-xl text-center py-8">
            <p className="text-muted text-lg">まだ採用された献立がありません</p>
            <p className="text-sm text-muted mt-2">
              どの家族もまだ献立を採用していません。
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            {suggestions.map((s) => (
              <PublicSuggestionCard
                key={s.id}
                suggestion={s}
                members={members}
                goodStatus={goodStatus[s.id]}
                goodCount={goodCount[s.id]}
                onToggleGood={handleToggleGood}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
