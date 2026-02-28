import { useCallback } from "react";
import { apiClient } from "@/shared/lib/api";

export function useFeedback() {
  const saveFeedback = useCallback(
    async (suggestionId, chosenOption, feedbackNote = "") => {
      await apiClient.post(`/api/suggestions/${suggestionId}/feedback`, {
        chosenOption,
        feedbackNote,
      });
    },
    [],
  );

  return { saveFeedback };
}
