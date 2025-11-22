"use client";

import { useState, useEffect, use } from "react";
import axios from "axios";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AuthHeader } from "@/components/auth_header";

export default function MenuShow({ params }) {
  const resolvedParams = use(params);
  const [menuId, setMenuId] = useState(null); // params.id を安全に扱うための state
  const [usertoken, setUsertoken] = useState("");
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    if (resolvedParams?.id) {
      setMenuId(resolvedParams.id);
    }
  }, [resolvedParams]);

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
        console.log(res.data);
        setMenu(res.data);
      } catch (error) {
        console.error("メニューの取得に失敗しました:", error);
      }
    };

    loadMenu();
  }, [usertoken, menuId]);

  const router = useRouter();

  // 編集処理（遷移）
  const handleEdit = () => {
    router.push(`/menus/${menuId}/edit`);
  };

  // 削除処理
  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      await axios.delete(`http://localhost:3001/api/menus/${menuId}`, {
        headers: { Authorization: `Bearer ${usertoken}` },
      });
      alert("削除しました");
      router.push("/menus/index");
    } catch (error) {
      console.error("削除に失敗しました:", error);
      alert("削除に失敗しました");
    }
  };

  // 一覧へ戻る
  const handleBackIndex = () => {
    router.push("/menus/index");
  };

  if (!menu) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="gra-page w-full min-h-screen p-8 flex flex-col items-center">
      <AuthHeader />

      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
        <h1 className="gra-title text-2xl font-bold">メニュー詳細</h1>
        <div className="gra-card w-full max-w-xl mt-6">
          <div className="gra-list-item text-center text-xl">{menu.menu}</div>

          <div className="flex gap-4 mt-6 justify-center">
            <button onClick={handleEdit} className="gra-btn">
              編集
            </button>
            <button onClick={handleDelete} className="gra-btn">
              削除
            </button>
            <button onClick={handleBackIndex} className="gra-btn">
              一覧へ戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
