"use client";

import { useState, useEffect, use } from "react";
import axios from "axios";
import { auth } from "../../../lib/firebase"; // パスはプロジェクト構成に合わせて調整
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AuthHeader } from "@/components/auth_header";
import { Footer } from "@/components/footer";

export default function MenuEdit({ params }) {
  const resolvedParams = use(params);
  const [usertoken, setUsertoken] = useState("");
  const [menu, setMenu] = useState(null);
  const [menuId, setMenuId] = useState(null);

  const router = useRouter();

  // params.id を　state にコピー
  useEffect(() => {
    if (resolvedParams?.id) {
      setMenuId(resolvedParams.id);
    }
  }, [resolvedParams]);

  // Firebase 認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUsertoken(token);
      } else {
        setUsertoken("");
      }
    });
    return () => unsubscribe();
  }, []);

  // メニュー情報を取得
  useEffect(() => {
    if (!usertoken || !menuId) return;

    const loadMenu = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/menus/${menuId}`,
          {
            headers: { Authorization: `Bearer ${usertoken}` },
          },
        );
        setMenu(res.data);
      } catch (error) {
        console.error("メニューの取得に失敗しました:", error);
      }
    };

    loadMenu();
  }, [usertoken, menuId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:3001/api/menus/${menuId}`,
        { menu: { menu: menu.menu } },
        {
          headers: { Authorization: `Bearer ${usertoken}` },
        },
      );
      router.push("/menus/index"); // 更新後に詳細ページへ遷移
    } catch (error) {
      console.error("メニューの更新に失敗しました:", error);
      alert("メニューの更新に失敗しました。");
    }
  };

  if (!menu) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center space-y-16">
      <AuthHeader />

      <h1 className="text-6xl font-bold text-gray-400 text-center">
        メニューを編集する
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>メニュー名</label>
          <input
            type="text"
            id="name"
            value={menu.menu || ""}
            onChange={(e) => setMenu({ ...menu, menu: e.target.value })}
            required
          />
        </div>

        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => router.push(`/menus/${menuId}`)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg shadow hover:bg-sky-600 ml-4"
          >
            キャンセル
          </button>
        </div>
      </form>
      <Footer />
    </div>
  );
}
