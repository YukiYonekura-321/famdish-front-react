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
import { PROVIDERS } from "../providers";

describe("PROVIDERS", () => {
  it("3 つのプロバイダ定義がある", () => {
    expect(PROVIDERS).toHaveLength(3);
  });

  it("Google プロバイダが含まれる", () => {
    const google = PROVIDERS.find((p) => p.name === "Google");
    expect(google).toBeDefined();
    expect(google.id).toBe(GoogleAuthProvider.PROVIDER_ID);
    expect(google.provider).toBeInstanceOf(GoogleAuthProvider);
  });

  it("Twitter プロバイダが含まれる", () => {
    const twitter = PROVIDERS.find((p) => p.name === "X(Twitter)");
    expect(twitter).toBeDefined();
    expect(twitter.id).toBe(TwitterAuthProvider.PROVIDER_ID);
    expect(twitter.provider).toBeInstanceOf(TwitterAuthProvider);
  });

  it("GitHub プロバイダが含まれる", () => {
    const github = PROVIDERS.find((p) => p.name === "Github");
    expect(github).toBeDefined();
    expect(github.id).toBe(GithubAuthProvider.PROVIDER_ID);
    expect(github.provider).toBeInstanceOf(GithubAuthProvider);
  });
});
