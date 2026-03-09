/**
 * useFeedback フックのテスト
 */
import { renderHook, act } from "@testing-library/react";
import { useFeedback } from "../useFeedback";

jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

import { apiClient } from "@/shared/lib/api";

describe("useFeedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("useFeedback フックが saveFeedback 関数を返す", () => {
    const { result } = renderHook(() => useFeedback());
    expect(result.current).toHaveProperty("saveFeedback");
    expect(typeof result.current.saveFeedback).toBe("function");
  });

  it("saveFeedback が API POST に正しい引数で呼び出される", async () => {
    apiClient.post.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFeedback());

    await act(async () => {
      await result.current.saveFeedback("suggestion-123", "option-A", "Great!");
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/suggestions/suggestion-123/feedback",
      {
        chosenOption: "option-A",
        feedbackNote: "Great!",
      },
    );
  });

  it("saveFeedback が feedbackNote なしで呼ばれてもエラーが発生しない", async () => {
    apiClient.post.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFeedback());

    await act(async () => {
      await result.current.saveFeedback("suggestion-456", "option-B");
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/suggestions/suggestion-456/feedback",
      {
        chosenOption: "option-B",
        feedbackNote: "",
      },
    );
  });
});
