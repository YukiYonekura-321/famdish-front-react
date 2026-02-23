"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { AuthHeader } from "../../../../components/auth_header";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

export default function AllSuggestionsPage() {
  const [usertoken, setUsertoken] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goodStatus, setGoodStatus] = useState({});
  const [goodCount, setGoodCount] = useState({});
  const [members, setMembers] = useState([]);
  const router = useRouter();

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

  // ── メンバー一覧取得 ──
  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchMembers = async () => {
      try {
        const res = await apiClient.get("/api/members/all");
        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("メンバー取得失敗:", error);
      }
    };
    fetchMembers();
  }, []);

  // ── 全家族の献立取得 ──
  useEffect(() => {
    if (!usertoken) return;

    const fetchAllSuggestions = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/api/recipes");
        const suggestionsData = Array.isArray(res.data) ? res.data : [];
        setSuggestions(suggestionsData);
        setLoading(false);

        // good ステータスと count をバックグラウンドで並列取得し、順次反映
        const promises = suggestionsData.map(async (s) => {
          const result = { id: s.id, status: null, count: 0 };
          const [statusRes, countRes] = await Promise.allSettled([
            apiClient.get("/api/goods/check_suggestion", {
              params: { suggestion_id: s.id },
            }),
            apiClient.get("/api/goods/count_suggestion", {
              params: { suggestion_id: s.id },
            }),
          ]);

          if (statusRes.status === "fulfilled") {
            result.status = {
              exists: statusRes.value.data.exists,
              good_id: statusRes.value.data.good?.id || null,
            };
          } else {
            result.status = { exists: false, good_id: null };
          }

          if (countRes.status === "fulfilled") {
            result.count = Number(countRes.value.data.count) || 0;
          }

          // 1件ずつ即座にstateへ反映
          setGoodStatus((prev) => ({ ...prev, [s.id]: result.status }));
          setGoodCount((prev) => ({ ...prev, [s.id]: result.count }));

          return result;
        });

        await Promise.allSettled(promises);
      } catch (error) {
        console.error("献立一覧の取得に失敗しました:", error);
        setSuggestions([]);
        setLoading(false);
      }
    };

    fetchAllSuggestions();
  }, [usertoken]);

  // ── いいね（good）トグル ──
  const handleToggleGood = async (suggestionId) => {
    try {
      if (goodStatus[suggestionId]?.exists) {
        const goodId = goodStatus[suggestionId].good_id;
        await apiClient.delete(`/api/goods/destroy_suggestion/${goodId}`);
        setGoodStatus((prev) => ({
          ...prev,
          [suggestionId]: { exists: false, good_id: null },
        }));
        setGoodCount((prev) => ({
          ...prev,
          [suggestionId]: Math.max((prev[suggestionId] || 0) - 1, 0),
        }));
      } else {
        const res = await apiClient.post("/api/goods/create_suggestion", {
          params: { suggestion_id: suggestionId },
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
  };

  return (
    <div className="gra-page p-8 flex flex-col items-center">
      <AuthHeader />

      <div className="w-full flex flex-col items-center gap-6 mt-12">
        <h1 className="gra-title">🌍 みんなの献立</h1>

        <p className="text-gray-600 text-sm text-center max-w-lg">
          他の家族で採用された献立も参考にできます。
          <br />
          新しいメニューのアイデアを見つけましょう！
        </p>

        <Link
          href="/menus/familysuggestion"
          className="text-blue-600 underline text-sm hover:text-blue-800"
        >
          ← わが家の献立に戻る
        </Link>

        {loading ? (
          <LoadingSpinner />
        ) : suggestions.length === 0 ? (
          <div className="gra-card w-full max-w-xl text-center py-8">
            <p className="text-gray-500 text-lg">
              まだ採用された献立がありません
            </p>
            <p className="text-gray-400 text-sm mt-2">
              どの家族もまだ献立を採用していません。
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            {suggestions.map((s) => (
              <div key={s.id} className="gra-card w-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        🍽️ {s.dish_name || "タイトルなし"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleToggleGood(s.id)}
                        className="focus:outline-none"
                      >
                        {goodStatus[s.id]?.exists ? (
                          <span className="text-2xl text-pink-500">❤️</span>
                        ) : (
                          <span className="text-2xl text-gray-400">🤍</span>
                        )}
                      </button>
                      <span className="text-sm text-gray-600">
                        {goodCount[s.id] ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      家族：{s.family_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>

                {s.reason && (
                  <p className="text-sm text-gray-600 mt-3">💡 {s.reason}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  👨‍🍳 調理者:
                  {s.proposer_id
                    ? members.find((m) => m.id === s.proposer_id)?.name ||
                      "不明"
                    : "未設定"}
                </p>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {s.cooking_time && <span>⏱️ {s.cooking_time}分</span>}
                  {s.servings && <span>👥 {s.servings}人分</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
