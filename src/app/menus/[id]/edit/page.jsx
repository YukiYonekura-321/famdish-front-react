"use client";

import { useState, useEffect, use } from "react";
import { apiClient } from "@/app/lib/api";
import { auth } from "../../../lib/firebase"; // パスはプロジェクト構成に合わせて調整
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AuthHeader } from "@/components/auth_header";

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
        const res = await apiClient.get(`/api/menus/${menuId}`);
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
      await apiClient.put(`/api/menus/${menuId}`, {
        menu: { menu: menu.menu },
      });
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
    <div className="gra-page min-h-screen p-8 flex flex-col items-center">
      <AuthHeader />

      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
        <h1 className="gra-title text-2xl font-bold">メニューを編集する</h1>

        <form
          onSubmit={handleSubmit}
          className="gra-card w-full max-w-2xl mt-6"
        >
          <div className="mb-4">
            <label className="block font-bold mb-2">メニュー名</label>
            <input
              type="text"
              id="name"
              value={menu.menu || ""}
              onChange={(e) => setMenu({ ...menu, menu: e.target.value })}
              required
              className="gra-input w-full"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button type="submit" className="gra-btn">
              保存
            </button>
            <button
              type="button"
              onClick={() => router.push(`/menus/${menuId}`)}
              className="gra-btn"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
