import axios from "axios";
import { auth } from "@/shared/lib/firebase";

// 決定する baseURL を先に計算
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
// process.env.NODE_ENV === "production"
//   ? process.env.VERCEL
//     ? // Vercelにデプロイした場合、HerokuのURL指定
//       process.env.NEXT_PUBLIC_API_URL
//     : // AWSにデプロイした場合、同じドメインだから、URLを空にする。
//       ""
//   : process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
