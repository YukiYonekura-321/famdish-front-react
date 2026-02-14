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

  // ── 全家族の献立取得 ──
  useEffect(() => {
    if (!usertoken) return;

    const fetchAllSuggestions = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/api/suggestions");
        setSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("献立一覧の取得に失敗しました:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSuggestions();
  }, [usertoken]);

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
                    <h3 className="text-lg font-bold text-gray-800">
                      🍽️ {s.ai_raw_json?.title || "タイトルなし"}
                    </h3>
                    <p className="text-sm text-blue-600 mt-1">
                      リクエスト：{s.requests}
                    </p>
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

                {s.ai_raw_json?.reason && (
                  <p className="text-sm text-gray-600 mt-3">
                    💡 {s.ai_raw_json.reason}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
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
      </div>
    </div>
  );
}
