"use client";

import { apiClient } from "@/app/lib/api";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { AuthHeader } from "../../components/auth_header";
import { useRouter } from "next/navigation";

export default function MenuCreate() {
  const [menu, setMenu] = useState("");
  const [message, setMessage] = useState("");
  const [usertoken, setUsertoken] = useState("");
  const [likes, setLikes] = useState([]); // likes一覧
  const router = useRouter();

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

  // トークンが変わったらメンバーを取得
  useEffect(() => {
    if (!usertoken) return; // tokenが空なら呼ばない

    // likes一覧取得
    const fetchLikes = async () => {
      try {
        const res = await apiClient.get("/api/likes");
        setLikes(res.data || []);
      } catch (e) {
        setLikes([]);
        if (e.response) {
          console.error("Error fetching likes:", e.response.data);
        } else {
          console.error("Network error while fetching likes");
        }
      }
    };
    fetchLikes();
  }, [usertoken]); // ← 依存配列に usertoken を入れるのがポイント

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usertoken) {
      alert("ログインしてください");
      return;
    }

    try {
      const res = await apiClient.post("/api/menus", {
        menu: {
          menu: menu, // menuは選択したlikeのidやname
        },
      });
      setMessage(`リクエスト成功ID: ${res.data.id}, 名前: ${res.data.menu}`);
      // フォーム送信後に入力欄を空にするための処理
      setMenu("");
      router.push("/menus/index");
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors || [
          "不明なエラーが発生しました",
        ];
        setMessage("リクエストに失敗しました:\n" + errors.join("\n"));
      } else {
        setMessage("リクエストに失敗しました: ネットワークエラー");
      }
    }
  };

  return (
    <div className="gra-page w-full min-h-screen p-8 flex flex-col items-center justify-center space-y-8">
      <AuthHeader className="z-10" />

      <h1 className="gra-title">食べたいものをリクエストしよう！</h1>

      <form
        onSubmit={handleSubmit}
        className="gra-card w-full max-w-xl flex flex-col items-center space-y-6"
      >
        <label className="font-bold text-2xl">リクエスト内容</label>

        <select
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          className="gra-input w-full"
        >
          <option value="">選択してください</option>
          {likes.map((like) => (
            <option key={like.id} value={like.name}>
              {like.name}
            </option>
          ))}
        </select>

        <p className="font-bold text-lg small-note">
          または、テキストでリクエスト内容を入力してください。
        </p>
        <input
          type="text"
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          className="gra-input w-full"
        />
        <button type="submit" className="gra-btn w-40 mx-auto">
          送信
        </button>
      </form>

      {message && <p className="mt-4 small-note">{message}</p>}
    </div>
  );
}
