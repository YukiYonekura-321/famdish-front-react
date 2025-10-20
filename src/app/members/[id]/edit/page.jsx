"use client";

import { useState, useEffect, use } from "react";
import axios from "axios";
import { auth } from "../../../lib/firebase"; // パスはプロジェクト構成に合わせて調整
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AuthHeader } from "@/components/auth_header";
import { Footer } from "@/components/footer";

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
        const res = await axios.get(
          `http://localhost:3001/api/members/${memberId}`,
          {
            headers: { Authorization: `Bearer ${usertoken}` },
          },
        );
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
      await axios.put(
        `http://localhost:3001/api/members/${memberId}`,
        {
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
        },
        {
          headers: { Authorization: `Bearer ${usertoken}` },
        },
      );
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
    <div>
      <AuthHeader />
      <h1 className="text-2xl font-bold mb-4">{initialName} さんの編集</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold mb-1">名前</label>
          <input
            type="text"
            name="name"
            value={member.name || ""}
            onChange={handleChangeName}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block font-bold mb-1">好きなもの</label>
          {likes?.map((like, idx) => (
            <input
              key={idx}
              value={like.name}
              onChange={(e) => {
                const newLikes = [...likes];
                const value = e.target.value;
                if (value === "") {
                  // 空なら削除
                  newLikes.splice(idx, 1);
                } else {
                  newLikes[idx] = { ...like, name: e.target.value };
                }
                setLikes(newLikes);
              }}
              // readOnly
              className="border rounded px-3 py-2 w-full"
            />
          ))}
        </div>

        <button
          type="button"
          className="px-6 py-2 text-white inline-block opacity-80 rounded bg-blue-500 shadow-[0_7px_#1a7940] active:shadow-none active:relative active:top-[7px] hover:opacity-100"
          onClick={() => setLikes([...likes, { name: "" }])}
        >
          +追加
        </button>

        {/* <div>
          <label className="block font-bold mb-1">好きなもの</label>
          <input
            type="text"
            name="likes"
            value={member.likes?.map((l) => l.name).join(", ") || ""}
            onChange={(e) => handleChangeArray("likes", e)}
            // readOnly
            className="border rounded px-3 py-2 w-full"
          />
        </div> */}

        <div>
          <label className="block font-bold mb-1">嫌いなもの</label>
          {dislikes?.map((dislike, idx) => (
            <input
              key={idx}
              value={dislike.name}
              onChange={(e) => {
                const newDislikes = [...dislikes];
                const value = e.target.value;
                if (value === "") {
                  // 空なら削除
                  newDislikes.splice(idx, 1);
                } else {
                  newDislikes[idx] = { ...dislike, name: e.target.value };
                }
                setDislikes(newDislikes);
              }}
              // readOnly
              className="border rounded px-3 py-2 w-full"
            />
          ))}
        </div>

        <button
          type="button"
          className="px-6 py-2 text-white inline-block opacity-80 rounded bg-blue-500 shadow-[0_7px_#1a7940] active:shadow-none active:relative active:top-[7px] hover:opacity-100"
          onClick={() => setDislikes([...dislikes, { name: "" }])}
        >
          +追加
        </button>

        {/* <div>
          <label className="block font-bold mb-1">嫌いなもの</label>
          <input
            type="text"
            name="dislikes"
            value={member.dislikes?.map((d) => d.name).join(", ") || ""}
            onChange={(e) => handleChangeArray("dislikes", e)}
            // readOnly
            className="border rounded px-3 py-2 w-full"
          />
        </div> */}

        {/* likes / dislikes 編集欄も追加可能 */}

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => router.push(`/members/${memberId}`)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
          >
            キャンセル
          </button>
        </div>
      </form>
      <Footer />
    </div>
  );
}
