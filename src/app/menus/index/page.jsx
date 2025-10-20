"use client";

import axios from "axios";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthHeader } from "@/components/auth_header";
import { Footer } from "@/components/footer";

export default function MenuIndex() {
  const [menu, setMenu] = useState([""]);
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
    <div className="p-8 flex flex-col items-center justify-center">
      <AuthHeader />

      <h1 className="text-6xl font-bold text-gray-400 text-center">
        リクエストされたメニュー一覧
      </h1>
      {menu.map((m, idx) => (
        <Link key={idx} href={`/menus/${m.id}`}>
          <div className="w-80 mx-auto p-4 border border-gray-300 hover:shadow-lg rounded-lg">
            <li className="list-none">{m.menu}</li>
          </div>
        </Link>
      ))}

      <Footer />
    </div>
  );
}
