import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

export const PROVIDERS = [
  {
    id: GoogleAuthProvider.PROVIDER_ID,
    name: "Google",
    provider: new GoogleAuthProvider(),
  },
  {
    id: TwitterAuthProvider.PROVIDER_ID,
    name: "X(Twitter)",
    provider: new TwitterAuthProvider(),
  },
  {
    id: GithubAuthProvider.PROVIDER_ID,
    name: "Github",
    provider: new GithubAuthProvider(),
  },
];
