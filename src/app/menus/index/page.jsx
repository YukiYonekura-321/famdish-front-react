"use client";

import axios from "axios";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthHeader } from "@/components/auth_header";

export default function MenuIndex() {
  const [menu, setMenu] = useState([]);
  const [usertoken, setUsertoken] = useState("");

  useEffect(() => {
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

    const loadMenu = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/menus", {
          headers: {
            Authorization: `Bearer ${usertoken}`,
            Accept: "application/json",
          },
        });
        console.log(res.data);
        setMenu(res.data);
      } catch (error) {
        console.error("メニューの取得に失敗しました:", error);
      }
    };

    loadMenu();
  }, [usertoken]); // ← 依存配列に usertoken を入

  return (
    <div className="gra-page p-8 flex flex-col items-center">
      <AuthHeader />

      <div className="w-full flex flex-col items-center gap-6 mt-12">
        <h1 className="text-2xl font-bold gra-title">
          リクエストされたメニュー一覧
        </h1>

        <div className="w-full flex flex-col items-center gap-4 mt-6">
          {menu.map((m) => (
            <Link key={m.id} href={`/menus/${m.id}`}>
              <div className="gra-card w-11/12 sm:w-80 cursor-pointer">
                <div>{m.menu}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
