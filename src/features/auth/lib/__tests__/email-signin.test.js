/**
 * email-signin.js のテスト
 */

jest.mock("firebase/auth", () => ({
  signInWithEmailLink: jest.fn(),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: {},
}));

jest.mock("@/features/auth/lib/provider-utils", () => ({
  getLinkedProviderIds: jest.fn(),
}));

import { handleEmailSignIn } from "../email-signin";
import { signInWithEmailLink } from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { getLinkedProviderIds } from "@/features/auth/lib/provider-utils";

describe("handleEmailSignIn", () => {
  let alertSpy;
  let promptSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    promptSpy = jest
      .spyOn(window, "prompt")
      .mockReturnValue("test@example.com");
  });

  afterEach(() => {
    alertSpy.mockRestore();
    promptSpy.mockRestore();
  });

  it("ユーザーにメールアドレスの入力を促す", async () => {
    signInWithEmailLink.mockResolvedValue({
      user: { providerData: [] },
    });
    getLinkedProviderIds.mockReturnValue(["google.com"]);

    await handleEmailSignIn();

    expect(promptSpy).toHaveBeenCalledWith(
      "確認のためメールアドレスを入力してください",
    );
  });

  it("IdP 連携ありの場合はアラートを出さない", async () => {
    signInWithEmailLink.mockResolvedValue({
      user: { providerData: [{ providerId: "google.com" }] },
    });
    getLinkedProviderIds.mockReturnValue(["google.com"]);

    await handleEmailSignIn();

    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("IdP 連携なしの場合は連携を促すアラートを出す", async () => {
    signInWithEmailLink.mockResolvedValue({
      user: { providerData: [] },
    });
    getLinkedProviderIds.mockReturnValue([]);

    await handleEmailSignIn();

    expect(alertSpy).toHaveBeenCalledWith(
      "メールが使えない場合に備えて、\nIdPとの連携を行ってください。",
    );
  });

  it("ログイン失敗時にエラーアラートを出す", async () => {
    signInWithEmailLink.mockRejectedValue(new Error("invalid-email-link"));

    await handleEmailSignIn();

    expect(alertSpy).toHaveBeenCalledWith(
      "ログインに失敗しました:invalid-email-link",
    );
  });

  it("signInWithEmailLink が正しい引数で呼ばれる", async () => {
    signInWithEmailLink.mockResolvedValue({
      user: { providerData: [] },
    });
    getLinkedProviderIds.mockReturnValue(["google.com"]);

    await handleEmailSignIn();

    expect(signInWithEmailLink).toHaveBeenCalledWith(
      auth,
      "test@example.com",
      window.location.href,
    );
  });
});
