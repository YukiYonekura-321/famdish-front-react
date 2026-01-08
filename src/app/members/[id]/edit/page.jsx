"use client";

import { useState, useEffect, use } from "react";
import { apiClient } from "@/app/lib/api";
import { auth } from "../../../lib/firebase"; // パスはプロジェクト構成に合わせて調整
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AuthHeader } from "@/components/auth_header";

export default function MemberEdit({ params }) {
  const resolvedParams = use(params);
  const [usertoken, setUsertoken] = useState("");
  const [member, setMember] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [initialName, setInitialName] = useState("");
  const [likes, setLikes] = useState([""]);
  const [dislikes, setDislikes] = useState([""]);

  const router = useRouter();

  // params.id を state にコピー
  useEffect(() => {
    if (resolvedParams?.id) {
      setMemberId(resolvedParams.id);
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

  // メンバー情報を取得
  useEffect(() => {
    if (!usertoken || !memberId) return;

    const loadMember = async () => {
      try {
        const res = await apiClient.get(`/api/members/${memberId}`);
        console.log(res.data.likes);
        setMember(res.data);
        setLikes(res.data.likes);
        setDislikes(res.data.dislikes);
        setInitialName(res.data.name); // 初期の名前を保存
      } catch (error) {
        console.error("メンバーの取得に失敗しました:", error);
      }
    };

    loadMember();
  }, [usertoken, memberId]);

  // 入力変更処理(名前)
  const handleChangeName = (e) => {
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  // const handleChangeArray = (field, e) => {
  //   const values = e.target.value
  //     .split(",")
  //     .map((name) => ({ name: name.trim() }));
  //   setMember({ ...member, [field]: values });
  // };

  // 保存処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submit token:", usertoken);
    console.log("submit payload:", {
      member: {
        name: member.name,
        likes_attributes: likes.map((like) => ({
          id: like.id,
          name: like.name,
        })),
        dislikes_attributes: dislikes.map((dislike) => ({
          id: dislike.id,
          name: dislike.name,
        })),
      },
    });

    try {
      await apiClient.put(`/api/members/${memberId}`, {
        member: {
          name: member.name,
          likes_attributes:
            likes.map((like) => ({
              id: like.id,
              name: like.name,
            })) || [],
          dislikes_attributes:
            dislikes.map((dislike) => ({
              id: dislike.id,
              name: dislike.name,
            })) || [],
        },
      });
      alert("更新しました");
      router.push(`/members/${memberId}`); // 詳細画面へ戻る
    } catch (error) {
      console.error("更新に失敗しました:", error);
      alert("更新に失敗しました");
    }
  };

  if (!member) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="gra-page min-h-screen p-8 flex flex-col items-center">
      <AuthHeader />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
      >
        <h1 className="gra-title text-6xl font-bold">
          {initialName} さんの編集
        </h1>

        <div className="gra-card mb-4">
          <label className="block text-2xl font-bold mb-1">名前</label>
          <input
            type="text"
            name="name"
            value={member.name || ""}
            onChange={handleChangeName}
            className="gra-input w-full"
          />
        </div>

        <div className="gra-card mb-4 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-2xl font-bold mb-1">好きなもの</label>
            {likes?.map((like, idx) => (
              <input
                key={idx}
                value={like.name}
                onChange={(e) => {
                  const newLikes = [...likes];
                  const value = e.target.value;
                  if (value === "") {
                    newLikes.splice(idx, 1);
                  } else {
                    newLikes[idx] = { ...like, name: value };
                  }
                  setLikes(newLikes);
                }}
                className="gra-input mb-2 w-full"
              />
            ))}

            <button
              type="button"
              className="gra-btn mt-2"
              onClick={() => setLikes([...likes, { name: "" }])}
            >
              +追加
            </button>
          </div>

          <div className="flex-1">
            <label className="block text-2xl font-bold mb-1">嫌いなもの</label>
            {dislikes?.map((dislike, idx) => (
              <input
                key={idx}
                value={dislike.name}
                onChange={(e) => {
                  const newDislikes = [...dislikes];
                  const value = e.target.value;
                  if (value === "") {
                    newDislikes.splice(idx, 1);
                  } else {
                    newDislikes[idx] = { ...dislike, name: value };
                  }
                  setDislikes(newDislikes);
                }}
                className="gra-input mb-2 w-full"
              />
            ))}

            <button
              type="button"
              className="gra-btn mt-2"
              onClick={() => setDislikes([...dislikes, { name: "" }])}
            >
              +追加
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="gra-btn">
            保存
          </button>
          <button
            type="button"
            onClick={() => router.push(`/members/${memberId}`)}
            className="gra-btn"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
