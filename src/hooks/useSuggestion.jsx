import { useState, useCallback } from "react";
import { apiClient } from "@/app/lib/api";

export function useSuggestion() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const fetchSuggestions = useCallback(
    async (requests, suggestionId, constraints = {}) => {
      setLoading(true);
      try {
        const body = {
          requests,
          sgId: suggestionId || null,
        };

        // 制約パラメータを追加
        if (constraints.budget) body.budget = constraints.budget;
        if (constraints.days) body.days = constraints.days;
        // eslint-disable-next-line camelcase
        if (constraints.cooking_time)
          body.cooking_time = constraints.cooking_time;

        const res = await apiClient.post("/api/suggestions", body);
        setSuggestions(res.data);
        return res.data;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, suggestions, fetchSuggestions };
}
