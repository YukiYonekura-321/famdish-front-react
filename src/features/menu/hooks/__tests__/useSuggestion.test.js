import { renderHook, act } from "@testing-library/react";
import { useSuggestion } from "../useSuggestion";

jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const { apiClient } = require("@/shared/lib/api");

describe("useSuggestion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("初期状態: loading=false, suggestions=null", () => {
    const { result } = renderHook(() => useSuggestion());
    expect(result.current.loading).toBe(false);
    expect(result.current.suggestions).toBeNull();
  });

  it("fetchSuggestions が POST→ポーリング→完了で suggestions をセットする", async () => {
    const completedData = {
      id: 1,
      status: "completed",
      menus: [{ name: "カレー" }],
    };
    apiClient.post.mockResolvedValueOnce({ data: { id: 1 } });
    // 1回目の GET: completed
    apiClient.get.mockResolvedValueOnce({ data: completedData });

    const { result } = renderHook(() => useSuggestion());

    await act(async () => {
      await result.current.fetchSuggestions(null, {});
    });

    expect(apiClient.post).toHaveBeenCalledWith("/api/suggestions", {
      sgId: null,
    });
    expect(result.current.suggestions).toEqual(completedData);
    expect(result.current.loading).toBe(false);
  });

  it("制約パラメータを POST ボディに含める", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 2 } });
    apiClient.get.mockResolvedValueOnce({
      data: { id: 2, status: "completed" },
    });

    const { result } = renderHook(() => useSuggestion());

    await act(async () => {
      await result.current.fetchSuggestions("prev-id", {
        budget: 1000,
        days: 3,
        cooking_time: 30,
      });
    });

    expect(apiClient.post).toHaveBeenCalledWith("/api/suggestions", {
      sgId: "prev-id",
      budget: 1000,
      days: 3,
      cooking_time: 30,
    });
  });

  it("ポーリングで status=failed の場合エラーが throw される", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 3 } });
    apiClient.get.mockResolvedValueOnce({
      data: { id: 3, status: "failed" },
    });

    const { result } = renderHook(() => useSuggestion());

    await expect(
      act(async () => {
        await result.current.fetchSuggestions(null, {});
      }),
    ).rejects.toThrow("AI生成に失敗しました");

    expect(result.current.loading).toBe(false);
  });

  it("stopPolling でポーリングが停止する", () => {
    const { result } = renderHook(() => useSuggestion());
    // stopPolling は例外を投げない
    expect(() => result.current.stopPolling()).not.toThrow();
  });
});
