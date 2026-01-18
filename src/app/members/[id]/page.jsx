"use client";

import { useState, useEffect, use } from "react";
import { apiClient } from "@/app/lib/api";
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
        const res = await apiClient.get(`/api/members/${memberId}`);
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
      await apiClient.delete(`/api/members/${memberId}`);
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
    <div className="gra-page min-h-screen p-8 flex flex-col items-center">
      <AuthHeader />

      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
        <h1 className="gra-title font-bold text-6xl">{member.name} さん</h1>

        <div className="gra-card w-full max-w-3xl mt-6">
          <div className="mb-4">
            <div className="font-bold text-lg">好きなもの</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {member.likes?.map((like) => (
                <div key={`like-${like.id}`} className="gra-list-item">
                  {like.name}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="font-bold text-lg">嫌いなもの</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {member.dislikes?.map((dislike) => (
                <div key={`dislike-${dislike.id}`} className="gra-list-item">
                  {dislike.name}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button onClick={handleEdit} className="gra-btn">
              編集
            </button>
            <button onClick={handleDelete} className="gra-btn">
              削除
            </button>
            <button onClick={handleBackIndex} className="gra-btn">
              メンバー一覧に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
