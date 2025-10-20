"use client";

import { useState, useEffect, use } from "react";
import axios from "axios";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
// import { AuthHeader } from "@/components/auth_header";
// import { Footer } from "@/components/footer";

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

  if (!menu) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center space-y-16">
      {/* <AuthHeader /> */}
      <h1 className="text-6xl font-bold text-gray-400 text-center">
        メニュー詳細
      </h1>
      {/* <pre>{JSON.stringify(menu, null, 2)}</pre> */}
      <div className="w-80 mx-auto p-4 border border-gray-300 hover:shadow-lg rounded-lg">
        {menu.menu}
      </div>

      <div className="mt-6 flex gap-32">
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-500 text-white rounded-2xl shadow-2xl hover:bg-blue-600"
        >
          編集
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
        >
          削除
        </button>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
