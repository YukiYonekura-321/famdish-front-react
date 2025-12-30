import { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../app/lib/firebase"; // Firebaseのauthをインポート
import { useEffect } from "react";

export function useFeedback() {
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

  const saveFeedback = async (
    suggestionId,
    chosenOption,
    feedbackNote = "",
  ) => {
    if (!usertoken) {
      alert("ログインしてください");
      return;
    }

    const res = await fetch(`/api/suggestions/${suggestionId}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usertoken}`,
      },
      body: JSON.stringify({
        chosenOption,
        feedbackNote,
      }),
    });

    if (!res.ok) {
      alert("データの保存に失敗しました");
      return;
    }
  };
  return { saveFeedback };
}
