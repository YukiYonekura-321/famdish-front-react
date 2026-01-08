import axios from "axios";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export const apiClient = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "" // 本番 → 相対パス
      : process.env.NEXT_PUBLIC_API_URL, // 開発 → http://localhost:3001
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    console.log(user);
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const fetchMenu = async () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("未ログインです");
        console.log(user);
        reject(new Error("未ログインです"));
        return;
      }

      try {
        const token = await user.getIdToken(); // 引数の`true`を消すと解決
        console.log("取得したトークン:", token); // ← ここで確認
        const res = await apiClient.get("/api/menus");
        resolve(res.data);
      } catch (err) {
        console.error("API呼び出しエラー:", err);
        reject(err);
      }
    });
  });
};
