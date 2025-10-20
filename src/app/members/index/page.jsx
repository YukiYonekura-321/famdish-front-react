"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { AuthHeader } from "@/components/auth_header";

export default function MemberForm() {
  const [usertoken, setUsertoken] = useState("");
  const [member, setMember] = useState([""]);

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

    const loadMember = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/members", {
          headers: { Authorization: `Bearer ${usertoken}` },
        });
        console.log(res.data);
        setMember(res.data);
      } catch (error) {
        console.error("メンバーの取得に失敗しました:", error);
      }
    };

    loadMember();
  }, [usertoken]); // ← 依存配列に usertoken を入れるのがポイント

  return (
    <div className="p-6 justify-center items-center flex flex-col">
      <AuthHeader />
      <h1 className="text-6xl font-bold text-gray-400 text-center">
        メンバー情報
      </h1>
      {member.map((m, idx) => (
        <div
          key={`member-${idx}-${m.id}`}
          className="p-4 w-1/2 border flex flex-col border-gray-300 hover:shadow-lg rounded-lg"
        >
          <ul className="list-none">
            <Link href={`/members/${m.id}`}>
              <li className="text-2xl font-semibold">{m.name}</li>
            </Link>
          </ul>
          <ul className="list-none">
            <li className="font-bold">好きなもの</li>
            {m.likes?.map((like) => (
              <li key={`likes-${m.id}-${like.id}`}>{like.name}</li>
            ))}
            <li className="font-bold">嫌いなもの</li>
            {m.dislikes?.map((dislike) => (
              <li key={`dislikes-${m.id}-${dislike.id}`}>{dislike.name}</li>
            ))}
          </ul>
        </div>
      ))}
      {/* <pre>{JSON.stringify(member, null, 2)}</pre> */}
    </div>
  );
}
