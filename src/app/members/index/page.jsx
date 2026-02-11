"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/app/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthHeader } from "@/components/auth_header";
import { useRouter } from "next/navigation";

export default function MemberForm() {
  const [usertoken, setUsertoken] = useState("");
  const [currentUid, setCurrentUid] = useState(null);
  const [member, setMember] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLikes, setEditLikes] = useState([]);
  const [editDislikes, setEditDislikes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUsertoken(token);
        setCurrentUid(user.uid);
      } else {
        setUsertoken("");
        setCurrentUid(null);
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // トークンが変わったらメンバーを取得
  useEffect(() => {
    if (!usertoken) return;

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
  }, [usertoken]);

  // 編集モーダルを開く
  const handleEditOpen = (m) => {
    const ownerUid = m.user?.firebase_uid || null;
    const isOwner = Boolean(currentUid && ownerUid && currentUid === ownerUid);

    if (!isOwner) {
      alert("このメンバーを編集する権限がありません。");
      return;
    }

    setEditingMember(m);
    setEditName(m.name);
    setEditLikes(m.likes || []);
    setEditDislikes(m.dislikes || []);
    setIsModalOpen(true);
  };

  // 編集モーダルを閉じる
  const handleEditClose = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  // 編集を保存
  const handleEditSave = async () => {
    if (!editingMember) return;

    try {
      await apiClient.put(`/api/members/${editingMember.id}`, {
        member: {
          name: editName,
          likes_attributes: editLikes.map((like) => ({
            id: like.id,
            name: like.name,
          })),
          dislikes_attributes: editDislikes.map((dislike) => ({
            id: dislike.id,
            name: dislike.name,
          })),
        },
      });
      alert("更新しました");
      handleEditClose();
      // メンバー情報を再取得
      const res = await apiClient.get("/api/members");
      setMember(res.data);
    } catch (error) {
      console.error("更新に失敗しました:", error);
      alert("更新に失敗しました");
    }
  };

  // 削除
  const handleDelete = async (m) => {
    const ownerUid = m.user?.firebase_uid || null;
    const isOwner = Boolean(currentUid && ownerUid && currentUid === ownerUid);

    if (!isOwner) {
      alert("このメンバーを削除する権限がありません。");
      return;
    }

    const confirmed = confirm(`${m.name}さんを削除してよろしいですか？`);
    if (!confirmed) return;

    try {
      await apiClient.delete(`/api/members/${m.id}`);
      alert("削除しました");
      // メンバー情報を再取得
      const res = await apiClient.get("/api/members");
      setMember(res.data);
    } catch (error) {
      console.error("削除に失敗しました:", error);
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="gra-page p-18 flex flex-col items-center">
      <AuthHeader />

      <div className="w-full flex flex-col gap-6 items-center mt-12">
        <h1 className="text-6xl font-bold gra-title">メンバー情報</h1>

        {member.map((m, idx) => {
          const ownerUid = m.user?.firebase_uid || null;
          const isOwner = Boolean(
            currentUid && ownerUid && currentUid === ownerUid,
          );

          return (
            <div
              key={`member-${idx}-${m.id}`}
              className="gra-card w-11/12 sm:w-1/2 flex flex-col"
            >
              <div className="text-sm md:text-2xl font-semibold mb-2">
                {m.name}
              </div>

              <div className="mt-2">
                <div className="md:font-bold mb-1">好きなもの</div>
                <div className="flex flex-wrap gap-2">
                  {m.likes?.map((like) => (
                    <div key={`likes-${m.id}-${like.id}`}>{like.name}</div>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <div className="md:font-bold mb-1">嫌いなもの</div>
                <div className="flex flex-wrap gap-2">
                  {m.dislikes?.map((dislike) => (
                    <div key={`dislikes-${m.id}-${dislike.id}`}>
                      {dislike.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* 編集・削除ボタン（オーナーのみ表示） */}
              {isOwner && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleEditOpen(m)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 編集モーダル */}
      {isModalOpen && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editName}さんを編集</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-1">名前</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="gra-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">好きなもの</label>
                {editLikes?.map((like, idx) => (
                  <div key={`edit-like-${idx}`} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={like.name}
                      onChange={(e) => {
                        const newLikes = [...editLikes];
                        newLikes[idx] = { ...like, name: e.target.value };
                        setEditLikes(newLikes);
                      }}
                      className="gra-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLikes = editLikes.filter((_, i) => i !== idx);
                        setEditLikes(newLikes);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      削除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEditLikes([...editLikes, { name: "" }])}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + 追加
                </button>
              </div>

              <div>
                <label className="block font-bold mb-1">嫌いなもの</label>
                {editDislikes?.map((dislike, idx) => (
                  <div key={`edit-dislike-${idx}`} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={dislike.name}
                      onChange={(e) => {
                        const newDislikes = [...editDislikes];
                        newDislikes[idx] = { ...dislike, name: e.target.value };
                        setEditDislikes(newDislikes);
                      }}
                      className="gra-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newDislikes = editDislikes.filter(
                          (_, i) => i !== idx,
                        );
                        setEditDislikes(newDislikes);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      削除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setEditDislikes([...editDislikes, { name: "" }])
                  }
                  className="text-sm text-blue-600 hover:underline"
                >
                  + 追加
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleEditSave}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                保存
              </button>
              <button
                onClick={handleEditClose}
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
