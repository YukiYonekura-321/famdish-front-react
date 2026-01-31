import { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../app/lib/firebase"; // Firebaseのauthをインポート
import { useEffect } from "react";

export function useSuggestion() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [usertoken, setUsertoken] = useState("");

  useEffect(() => {
    // 認証状態監視
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUsertoken(token);
      } else {
        setUsertoken("");
      }
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, []);

  const fetchSuggestions = async (requests, suggestionId) => {
    if (!usertoken) {
      alert("ログインしてください");
      return;
    }

    setLoading(true);

    const base =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_API_URL // 本番 → 相対パス
        : process.env.NEXT_PUBLIC_API_URL; // 開発 → http://localhost:3001

    const res = await fetch(`${base}/api/suggestions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usertoken}`,
      },
      body: JSON.stringify({
        requests,
        sgId: suggestionId || null, // suggestionIdがない場合はnullを渡す
      }),
    });

    if (!res.ok) {
      setLoading(false);
      alert("提案の取得に失敗しました");
      return;
    }

    const data = await res.json();
    setSuggestions(data);
    setLoading(false);
  };

  return { loading, suggestions, fetchSuggestions };
}
