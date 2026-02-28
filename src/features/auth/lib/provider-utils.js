import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

// 連携済みの全てのプロバイダIDプロパティの配列を返す
export const getLinkedProviderIds = (user) => {
  const linkedProviderIds = user.providerData
    .map((provider) => provider.providerId)
    .filter(
      (providerId) =>
        providerId === GoogleAuthProvider.PROVIDER_ID ||
        providerId === TwitterAuthProvider.PROVIDER_ID ||
        providerId === GithubAuthProvider.PROVIDER_ID,
    );

  return linkedProviderIds;
};

// 連携済みのプロバイダインスタンスを1つだけ返す
export const getProvider = (user) => {
  const providerIds = user.providerData.map((p) => p.providerId);
  //Googleを優先する
  if (providerIds.includes(GoogleAuthProvider.PROVIDER_ID)) {
    return new GoogleAuthProvider();
  } else if (providerIds.includes(TwitterAuthProvider.PROVIDER_ID)) {
    return new TwitterAuthProvider();
  } else if (providerIds.includes(GithubAuthProvider.PROVIDER_ID)) {
    return new GithubAuthProvider();
  }

  return null;
};
