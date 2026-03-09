// firebase/auth をモック (fetch is not defined 対策)
jest.mock("firebase/auth", () => {
  class GoogleAuthProvider {}
  GoogleAuthProvider.PROVIDER_ID = "google.com";

  class TwitterAuthProvider {}
  TwitterAuthProvider.PROVIDER_ID = "twitter.com";

  class GithubAuthProvider {}
  GithubAuthProvider.PROVIDER_ID = "github.com";

  return { GoogleAuthProvider, TwitterAuthProvider, GithubAuthProvider };
});

import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { getLinkedProviderIds, getProvider } from "../provider-utils";

const mockUser = (providerIds) => ({
  providerData: providerIds.map((providerId) => ({ providerId })),
});

describe("getLinkedProviderIds", () => {
  it("Google, Twitter, GitHub のプロバイダ ID のみ返す", () => {
    const user = mockUser([
      GoogleAuthProvider.PROVIDER_ID,
      TwitterAuthProvider.PROVIDER_ID,
      GithubAuthProvider.PROVIDER_ID,
      "password", // email/password -- フィルタ対象外
    ]);
    const result = getLinkedProviderIds(user);
    expect(result).toEqual([
      GoogleAuthProvider.PROVIDER_ID,
      TwitterAuthProvider.PROVIDER_ID,
      GithubAuthProvider.PROVIDER_ID,
    ]);
  });

  it("該当プロバイダがない場合は空配列を返す", () => {
    const user = mockUser(["password"]);
    expect(getLinkedProviderIds(user)).toEqual([]);
  });

  it("providerData が空の場合は空配列を返す", () => {
    const user = mockUser([]);
    expect(getLinkedProviderIds(user)).toEqual([]);
  });
});

describe("getProvider", () => {
  it("Google 連携済みの場合 GoogleAuthProvider を返す", () => {
    const user = mockUser([GoogleAuthProvider.PROVIDER_ID]);
    expect(getProvider(user)).toBeInstanceOf(GoogleAuthProvider);
  });

  it("Twitter のみ連携の場合 TwitterAuthProvider を返す", () => {
    const user = mockUser([TwitterAuthProvider.PROVIDER_ID]);
    expect(getProvider(user)).toBeInstanceOf(TwitterAuthProvider);
  });

  it("GitHub のみ連携の場合 GithubAuthProvider を返す", () => {
    const user = mockUser([GithubAuthProvider.PROVIDER_ID]);
    expect(getProvider(user)).toBeInstanceOf(GithubAuthProvider);
  });

  it("Google 優先: Google と Twitter が両方ある場合 GoogleAuthProvider を返す", () => {
    const user = mockUser([
      TwitterAuthProvider.PROVIDER_ID,
      GoogleAuthProvider.PROVIDER_ID,
    ]);
    expect(getProvider(user)).toBeInstanceOf(GoogleAuthProvider);
  });

  it("該当プロバイダがない場合 null を返す", () => {
    const user = mockUser(["password"]);
    expect(getProvider(user)).toBeNull();
  });
});
