"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/app/lib/api";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthHeader } from "../../components/auth_header";
import { useRouter } from "next/navigation";

export default function MemberForm() {
  const [name, setName] = useState("");
  const [familyname, setFamilyName] = useState(""); // 家族名を追加
  const [likes, setLikes] = useState([""]);
  const [dislikes, setDislikes] = useState([""]);
  const [message, setMessage] = useState("");
  // const [usertoken, setUsertoken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // if (user) {
      //   const token = await user.getIdToken();
      //   setUsertoken(token);
      // } else {
      //   setUsertoken("");
      // }
      setCurrentUser(user);
      console.log(auth.currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (authLoading) {
      setMessage("認証状態を確認中です");
      return;
    }

    if (!currentUser) {
      setMessage("ログインしてください");
      return;
    }

    // if (!usertoken) {
    //   setMessage("ログインしてください");
    //   return;
    // }

    // likes/dislikes をnested attributes 形式に変換
    try {
      const res = await apiClient.post("/api/members", {
        member: {
          name,
          likes_attributes: likes.filter((l) => l).map((l) => ({ name: l })),
          dislikes_attributes: dislikes
            .filter((d) => d)
            .map((d) => ({ name: d })),
        },
        family: {
          name: familyname || "Default Family",
        },
      });
      setMessage(`作成成功ID: ${res.data.id}, 名前: ${res.data.name}
        好きなもの: ${res.data.likes.map((l) => l.name).join(", ")}
        嫌いなもの: ${res.data.dislikes.map((d) => d.name).join(", ")}`);
      router.push("/members/index");
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors || [
          error.response.data.error,
        ];
        // Railsの422エラーや401エラーなどのレスポンスがある場合
        setMessage(`エラー: ${errors.join(", ")}`);
      } else {
        setMessage("通信エラーが発生しました");
      }
    }
  };

  return (
    <div className="gra-page min-h-screen">
      <AuthHeader />
      <div className="relative w-full min-h-screen p-8 flex flex-col items-center justify-center">
        <h1 className="gra-title text-2xl font-bold">メンバー登録</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-16">
          <div className="gra-card space-y-4">
            <p className="small-note">新しいメンバーを登録します。</p>
            <div className="flex gap-8 items-center">
              <div className="flex flex-col">
                <label className="font-bold">名前</label>
                <input
                  type="text"
                  placeholder="全半角英数字で入力"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="gra-input w-72"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-bold">家族名</label>
                <input
                  type="text"
                  placeholder="家族の名前（例：鈴木家）"
                  value={familyname}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="gra-input w-72"
                />
              </div>
            </div>
          </div>

          <div className="gra-card space-y-4">
            <p className="small-note">
              好きなものと嫌いなものを入力してください。
            </p>
            <div className="flex gap-8 items-start">
              <div className="flex flex-col">
                <label className="font-bold">好きなもの</label>
                {likes.map((like, idx) => (
                  <input
                    key={idx}
                    value={like}
                    placeholder="全半角英数字で入力"
                    onChange={(e) => {
                      const newLikes = [...likes];
                      newLikes[idx] = e.target.value;
                      setLikes(newLikes);
                    }}
                    className="gra-input mb-2 w-64"
                  />
                ))}
                <button
                  type="button"
                  className="gra-btn mt-1 w-fit"
                  onClick={() => setLikes([...likes, ""])}
                >
                  +追加
                </button>
              </div>

              <div className="flex flex-col">
                <label className="font-bold">嫌いなもの</label>
                {dislikes.map((dislike, idx) => (
                  <input
                    key={idx}
                    value={dislike}
                    placeholder="全半角英数字で入力"
                    onChange={(e) => {
                      const newDislikes = [...dislikes];
                      newDislikes[idx] = e.target.value;
                      setDislikes(newDislikes);
                    }}
                    className="gra-input mb-2 w-64"
                  />
                ))}
                <button
                  type="button"
                  className="gra-btn mt-1 w-fit"
                  onClick={() => setDislikes([...dislikes, ""])}
                >
                  +追加
                </button>
              </div>
            </div>
            <button type="submit" className="gra-btn w-full mt-4">
              登録
            </button>
          </div>
        </form>

        {message && <p className="mt-4 small-note">{message}</p>}
      </div>
    </div>
  );
}
