"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/app/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { AuthHeader } from "@/components/auth_header";

export default function MemberForm() {
  const [usertoken, setUsertoken] = useState("");
  const [member, setMember] = useState([]);

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
        const res = await apiClient.get("/api/members");
        console.log(res.data);
        setMember(res.data);
      } catch (error) {
        console.error("メンバーの取得に失敗しました:", error);
      }
    };

    loadMember();
  }, [usertoken]); // ← 依存配列に usertoken を入れるのがポイント

  return (
    <div className="gra-page p-18 flex flex-col items-center">
      <AuthHeader />

      <div className="w-full flex flex-col gap-6 items-center mt-12">
        <h1 className="text-6xl font-bold gra-title">メンバー情報</h1>

        {member.map((m, idx) => (
          <div
            key={`member-${idx}-${m.id}`}
            className="gra-card w-11/12 sm:w-1/2 flex flex-col"
          >
            <Link href={`/members/${m.id}`}>
              <div className="text-2xl font-semibold mb-2">{m.name}</div>
            </Link>

            <div className="mt-2">
              <div className="font-bold mb-1">好きなもの</div>
              <div className="flex flex-wrap gap-2">
                {m.likes?.map((like) => (
                  <div
                    key={`likes-${m.id}-${like.id}`}
                    className="gra-list-item"
                  >
                    {like.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <div className="font-bold mb-1">嫌いなもの</div>
              <div className="flex flex-wrap gap-2">
                {m.dislikes?.map((dislike) => (
                  <div
                    key={`dislikes-${m.id}-${dislike.id}`}
                    className="gra-list-item"
                  >
                    {dislike.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* <pre>{JSON.stringify(member, null, 2)}</pre> */}
    </div>
  );
}
