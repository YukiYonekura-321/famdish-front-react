/**
 * delete-user.js のテスト
 */

// 依存モジュールのモック
jest.mock("firebase/auth", () => ({
  reauthenticateWithPopup: jest.fn(),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { currentUser: null },
}));

jest.mock("@/shared/lib/api", () => ({
  apiClient: { delete: jest.fn() },
}));

jest.mock("@/features/auth/lib/provider-utils", () => ({
  getProvider: jest.fn(),
}));

import { deleteUser } from "../delete-user";
import { reauthenticateWithPopup } from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { apiClient } from "@/shared/lib/api";
import { getProvider } from "@/features/auth/lib/provider-utils";

describe("deleteUser", () => {
  let alertSpy;
  let confirmSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);
  });

  afterEach(() => {
    alertSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("currentUser が null の場合「ログインしてください」をアラート", async () => {
    auth.currentUser = null;

    await deleteUser();

    expect(alertSpy).toHaveBeenCalledWith("ログインしてください");
  });

  it("confirm でキャンセルした場合は何もしない", async () => {
    auth.currentUser = { delete: jest.fn(), providerData: [] };
    getProvider.mockReturnValue(null);
    confirmSpy.mockReturnValue(false);

    await deleteUser();

    expect(apiClient.delete).not.toHaveBeenCalled();
  });

  it("正常系: provider ありの場合、再認証→API削除→Firebase削除→リダイレクト", async () => {
    const mockUser = {
      delete: jest.fn().mockResolvedValue(undefined),
      providerData: [{ providerId: "google.com" }],
    };
    auth.currentUser = mockUser;
    const mockProvider = { providerId: "google.com" };
    getProvider.mockReturnValue(mockProvider);
    reauthenticateWithPopup.mockResolvedValue({});
    apiClient.delete.mockResolvedValue({});

    await deleteUser();

    expect(reauthenticateWithPopup).toHaveBeenCalledWith(
      mockUser,
      mockProvider,
    );
    expect(apiClient.delete).toHaveBeenCalledWith("/api/users/me");
    expect(mockUser.delete).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("退会しました");
    // window.location.href = "/login" へのリダイレクトは jsdom 制約のため検証省略
  });

  it("正常系: provider なしの場合、再認証なしで削除を実行", async () => {
    const mockUser = {
      delete: jest.fn().mockResolvedValue(undefined),
      providerData: [],
    };
    auth.currentUser = mockUser;
    getProvider.mockReturnValue(null);
    apiClient.delete.mockResolvedValue({});

    await deleteUser();

    expect(reauthenticateWithPopup).not.toHaveBeenCalled();
    expect(apiClient.delete).toHaveBeenCalledWith("/api/users/me");
    expect(mockUser.delete).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("退会しました");
  });

  it("auth/requires-recent-login エラーで再ログインを促す", async () => {
    const mockUser = {
      delete: jest.fn(),
      providerData: [],
    };
    auth.currentUser = mockUser;
    getProvider.mockReturnValue(null);
    apiClient.delete.mockRejectedValue({
      code: "auth/requires-recent-login",
    });

    await deleteUser();

    expect(alertSpy).toHaveBeenCalledWith("安全のため再ログインが必要です");
    // window.location.href = "/login" へのリダイレクトは jsdom 制約のため検証省略
  });

  it("その他のエラーでエラーメッセージを表示", async () => {
    const mockUser = {
      delete: jest.fn(),
      providerData: [],
    };
    auth.currentUser = mockUser;
    getProvider.mockReturnValue(null);
    apiClient.delete.mockRejectedValue({
      message: "ネットワークエラー",
    });

    await deleteUser();

    expect(alertSpy).toHaveBeenCalledWith(
      "退会に失敗しました\nネットワークエラー",
    );
  });
});
