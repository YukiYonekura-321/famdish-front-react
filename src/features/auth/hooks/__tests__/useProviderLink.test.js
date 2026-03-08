import { renderHook, act } from "@testing-library/react";
import { useProviderLink } from "../useProviderLink";
import { linkWithPopup, unlink } from "firebase/auth";

// firebase/auth のモック
jest.mock("firebase/auth", () => ({
  linkWithPopup: jest.fn(),
  unlink: jest.fn(),
  GoogleAuthProvider: { PROVIDER_ID: "google.com" },
  TwitterAuthProvider: { PROVIDER_ID: "twitter.com" },
  GithubAuthProvider: { PROVIDER_ID: "github.com" },
}));

const makeUser = (providerIds) => ({
  providerData: providerIds.map((providerId) => ({ providerId })),
  reload: jest.fn(() => Promise.resolve()),
});

describe("useProviderLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("user=null の場合 linkedProviders は空配列", () => {
    const { result } = renderHook(() => useProviderLink(null));
    expect(result.current.linkedProviders).toEqual([]);
  });

  it("user がある場合 linkedProviders を初期化する", () => {
    const user = makeUser(["google.com", "twitter.com"]);
    const { result } = renderHook(() => useProviderLink(user));
    expect(result.current.linkedProviders).toEqual([
      "google.com",
      "twitter.com",
    ]);
  });

  it("canUnlink は linkedProviders が 2 以上のとき true", () => {
    const user = makeUser(["google.com", "twitter.com"]);
    const { result } = renderHook(() => useProviderLink(user));
    expect(result.current.canUnlink).toBe(true);
  });

  it("canUnlink は linkedProviders が 1 のとき false", () => {
    const user = makeUser(["google.com"]);
    const { result } = renderHook(() => useProviderLink(user));
    expect(result.current.canUnlink).toBe(false);
  });

  it("linkProvider が成功したとき processing→false, error 空", async () => {
    const user = makeUser(["google.com"]);
    linkWithPopup.mockResolvedValueOnce({});
    // reload 後の providerData を更新
    user.reload.mockImplementationOnce(() => {
      user.providerData = [
        { providerId: "google.com" },
        { providerId: "twitter.com" },
      ];
      return Promise.resolve();
    });

    const { result } = renderHook(() => useProviderLink(user));

    const mockProvider = { providerId: "twitter.com" };
    await act(async () => {
      await result.current.linkProvider(mockProvider);
    });

    expect(linkWithPopup).toHaveBeenCalledWith(user, mockProvider);
    expect(result.current.processing).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("linkProvider が失敗したとき error にメッセージが入る", async () => {
    const user = makeUser(["google.com"]);
    linkWithPopup.mockRejectedValueOnce(new Error("popup closed"));

    const { result } = renderHook(() => useProviderLink(user));

    await act(async () => {
      await result.current.linkProvider({ providerId: "twitter.com" });
    });

    expect(result.current.error).toBe("popup closed");
    expect(result.current.processing).toBe(false);
  });

  it("unlinkProvider が成功したとき連携状態を更新する", async () => {
    const user = makeUser(["google.com", "twitter.com"]);
    unlink.mockResolvedValueOnce({});
    user.reload.mockImplementationOnce(() => {
      user.providerData = [{ providerId: "google.com" }];
      return Promise.resolve();
    });

    const { result } = renderHook(() => useProviderLink(user));

    await act(async () => {
      await result.current.unlinkProvider("twitter.com");
    });

    expect(unlink).toHaveBeenCalledWith(user, "twitter.com");
    expect(result.current.linkedProviders).toEqual(["google.com"]);
    expect(result.current.processing).toBe(false);
  });

  it("unlinkProvider が失敗したとき error にメッセージが入る", async () => {
    const user = makeUser(["google.com", "twitter.com"]);
    unlink.mockRejectedValueOnce(new Error("unlink failed"));

    const { result } = renderHook(() => useProviderLink(user));

    await act(async () => {
      await result.current.unlinkProvider("twitter.com");
    });

    expect(result.current.error).toBe("unlink failed");
    expect(result.current.processing).toBe(false);
  });

  it("user=null のとき linkProvider/unlinkProvider は何もしない", async () => {
    const { result } = renderHook(() => useProviderLink(null));

    await act(async () => {
      await result.current.linkProvider({ providerId: "google.com" });
      await result.current.unlinkProvider("google.com");
    });

    expect(linkWithPopup).not.toHaveBeenCalled();
    expect(unlink).not.toHaveBeenCalled();
  });
});
