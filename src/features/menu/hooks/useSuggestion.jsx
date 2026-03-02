import { useState, useCallback, useRef } from "react";
import { apiClient } from "@/shared/lib/api";

const POLL_INTERVAL = 2000; // 2秒ごとにポーリング
const POLL_TIMEOUT = 120000; // 最大120秒でタイムアウト

export function useSuggestion() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const pollingRef = useRef(null);

  /** ポーリングを停止 */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  /** GET /api/suggestions/:id をポーリングし completed を待つ */
  const pollUntilCompleted = useCallback(
    (suggestionId) =>
      new Promise((resolve, reject) => {
        const start = Date.now();

        const poll = async () => {
          try {
            const res = await apiClient.get(`/api/suggestions/${suggestionId}`);
            const { status } = res.data;

            if (status === "completed") {
              stopPolling();
              resolve(res.data);
              return;
            }

            if (status === "failed") {
              stopPolling();
              reject(new Error("AI生成に失敗しました。再度お試しください。"));
              return;
            }

            // タイムアウト判定
            if (Date.now() - start > POLL_TIMEOUT) {
              stopPolling();
              reject(
                new Error(
                  "AI生成がタイムアウトしました。しばらくしてから再度お試しください。",
                ),
              );
            }
          } catch (error) {
            stopPolling();
            reject(error);
          }
        };

        // 初回は即実行、以降はインターバルで
        poll();
        pollingRef.current = setInterval(poll, POLL_INTERVAL);
      }),
    [stopPolling],
  );

  const fetchSuggestions = useCallback(
    async (suggestionId, constraints = {}) => {
      stopPolling();
      setLoading(true);
      setSuggestions(null);

      try {
        const body = {
          sgId: suggestionId || null,
        };

        // 制約パラメータを追加
        if (constraints.budget) body.budget = constraints.budget;
        if (constraints.days) body.days = constraints.days;

        if (constraints.cooking_time)
          body.cooking_time = constraints.cooking_time;

        // POST → 即レスポンス（id + status: "pending"）
        const res = await apiClient.post("/api/suggestions", body);
        const { id } = res.data;

        // ポーリングで completed を待つ
        const completed = await pollUntilCompleted(id);
        setSuggestions(completed);
        return completed;
      } finally {
        setLoading(false);
      }
    },
    [stopPolling, pollUntilCompleted],
  );

  return { loading, suggestions, fetchSuggestions, stopPolling };
}
