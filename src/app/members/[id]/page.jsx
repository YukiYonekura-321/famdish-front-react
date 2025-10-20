"use client";

import { useState, useEffect, use } from "react";
import axios from "axios";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AuthHeader } from "@/components/auth_header";

export default function MemberForm({ params }) {
  const resolvedParams = use(params);
  const [usertoken, setUsertoken] = useState("");
  const [member, setMember] = useState(null);
  const [memberId, setMemberId] = useState(null); // params.id を安全に扱うための state

  useEffect(() => {
    // params.id を安全に state にコピー
    if (resolvedParams?.id) {
      setMemberId(resolvedParams.id);
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

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, []);

  // トークンが変わったらメンバーを取得
  useEffect(() => {
    if (!usertoken || !memberId) return; // tokenが空なら呼ばない

    const loadMember = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/members/${memberId}`,
          {
            headers: { Authorization: `Bearer ${usertoken}` },
          },
        );
        console.log(res.data);
        setMember(res.data);
      } catch (error) {
        console.error("メンバーの取得に失敗しました:", error);
      }
    };

    loadMember();
  }, [usertoken, memberId]);

  const router = useRouter();

  // 編集処理（遷移）
  const handleEdit = () => {
    router.push(`/members/${memberId}/edit`);
  };

  // 削除処理
  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      await axios.delete(`http://localhost:3001/api/members/${memberId}`, {
        headers: { Authorization: `Bearer ${usertoken}` },
      });
      alert("削除しました");
      router.push("/members/index"); // 一覧に戻る
    } catch (error) {
      console.error("削除に失敗しました:", error);
      alert("削除に失敗しました");
    }
  };

  const handleBackIndex = () => {
    router.push("/members/index");
  };

  if (!member) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center">
      <AuthHeader />
      <h1 className="absolute top-1/5 text-6xl font-bold text-gray-400 text-center mb-4">
        {member.name} さん
      </h1>
      <ul className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 list-none border-white-400ml-4">
        <div className="border border-gray-400 p-4">
          <li className="font-bold text-2xl">好きなもの</li>
          {member.likes?.map((like) => (
            <li key={`like-${like.id}`} className="text-lg">
              {like.name}
            </li>
          ))}
        </div>
        <div className="border border-gray-400 p-4">
          <li className="font-bold text-2xl">嫌いなもの</li>
          {member.dislikes?.map((dislike) => (
            <li key={`dislike-${dislike.id}`} className="text-lg">
              {dislike.name}
            </li>
          ))}
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

        <button
          onClick={handleBackIndex}
          className="m-4 items-center px-4 py-2 bg-orange-400 text-white rounded-lg shadow hover:bg-orange-600"
        >
          メンバー一覧に戻る
        </button>
      </ul>

      {/* <Link href={`members/${memberId}/edit`}>編集</Link>

      <Link href={`members/${memberId}/delete`}>削除</Link> */}
    </div>
  );
}
