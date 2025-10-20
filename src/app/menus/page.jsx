"use client";

import axios from "axios";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { AuthHeader } from "../../components/auth_header";
import { Footer } from "../../components/footer";
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
        const res = await axios.get("http://localhost:3001/api/likes", {
          headers: {
            Authorization: `Bearer ${usertoken}`,
            Accept: "application/json",
          },
        });
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
      const res = await axios.post(
        "http://localhost:3001/api/menus",
        {
          menu: {
            menu: menu, // menuは選択したlikeのidやname
          },
        },
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
            "Content-Type": "application/json",
            Accept: "application/json", // ← これを必ず追加！
          },
        },
      );
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
    <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center space-y-16">
      <AuthHeader />

      <h1 className="text-4xl">食べたいものをリクエストしよう！</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center space-y-8"
      >
        <label className="font-bold text-lg">リクエスト内容</label>
        <select
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          className="border"
        >
          <option value="">選択してください</option>
          {likes.map((like) => (
            <option key={like.id} value={like.name}>
              {like.name}
            </option>
          ))}
        </select>

        <p className="font-bold text-lg">
          または、テキストでリクエスト内容を入力してください。
        </p>
        <input
          type="text"
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          className="border w-full"
        />
        <button
          type="submit"
          className="px-6 py-2 w-40 mx-auto text-white inline-block opacity-80 rounded bg-blue-500 shadow-[0_7px_#1a7940] active:shadow-none hover:opacity-100"
        >
          送信
        </button>
      </form>
      {message && <p>{message}</p>}

      <Footer />
    </div>
  );
}
