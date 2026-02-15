"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { AuthHeader } from "../../../components/auth_header";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

export default function FamilySuggestionPage() {
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

  // ── 自分の家族の過去の献立取得 ──
  useEffect(() => {
    if (!usertoken) return;

    const fetchFamilySuggestions = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/api/suggestions/check");
        setSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("家族の献立取得に失敗しました:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilySuggestions();
  }, [usertoken]);

  return (
    <div className="gra-page p-8 flex flex-col items-center">
      <AuthHeader />

      <div className="w-full flex flex-col items-center gap-6 mt-12">
        <h1 className="gra-title">🏠 わが家の過去の献立</h1>

        <p className="text-gray-600 text-sm text-center max-w-lg">
          家族の中で過去に採用された献立の一覧です。
          <br />
          過去のメニューを参考に、今日の献立を考えましょう！
        </p>

        <Link
          href="/menus/familysuggestion/suggestion"
          className="text-blue-600 underline text-sm hover:text-blue-800"
        >
          👀 他の家族の献立も参考にする →
        </Link>

        {loading ? (
          <LoadingSpinner />
        ) : suggestions.length === 0 ? (
          <div className="gra-card w-full max-w-xl text-center py-8">
            <p className="text-gray-500 text-lg">
              まだ採用された献立がありません
            </p>
            <p className="text-gray-400 text-sm mt-2">
              リクエストページから献立の提案を受けて、OKを押すとここに表示されます。
            </p>
            <Link href="/menus" className="gra-btn inline-block mt-4">
              リクエストページへ
            </Link>
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
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString("ja-JP")}
                  </span>
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

        <div className="flex gap-4 mt-8 justify-center">
          <Link
            href="/menus"
            className="gra-btn bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
          >
            リクエストページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
