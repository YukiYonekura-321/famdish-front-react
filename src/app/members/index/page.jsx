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
  const [removedLikeIds, setRemovedLikeIds] = useState([]);
  const [removedDislikeIds, setRemovedDislikeIds] = useState([]);
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
    const isOwner = ownerUid ? currentUid === ownerUid : Boolean(currentUid);

    if (!isOwner) {
      alert("このメンバーを編集する権限がありません。");
      return;
    }

    setEditingMember(m);
    setEditName(m.name);
    setEditLikes(m.likes || []);
    setEditDislikes(m.dislikes || []);
    setRemovedLikeIds([]);
    setRemovedDislikeIds([]);
    setIsModalOpen(true);
  };

  // 編集モーダルを閉じる
  const handleEditClose = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setRemovedLikeIds([]);
    setRemovedDislikeIds([]);
  };

  // 編集を保存
  const handleEditSave = async () => {
    if (!editingMember) return;

    try {
      // 残す項目＋削除マーク付きの既存項目をまとめて送る
      const likesAttrs = [
        ...editLikes.map((like) =>
          like.id ? { id: like.id, name: like.name } : { name: like.name },
        ),
        ...removedLikeIds.map((id) => ({ id, _destroy: true })),
      ];

      const dislikesAttrs = [
        ...editDislikes.map((dislike) =>
          dislike.id
            ? { id: dislike.id, name: dislike.name }
            : { name: dislike.name },
        ),
        ...removedDislikeIds.map((id) => ({ id, _destroy: true })),
      ];

      await apiClient.put(`/api/members/${editingMember.id}`, {
        member: {
          name: editName,
          // eslint-disable-next-line camelcase
          likes_attributes: likesAttrs,
          // eslint-disable-next-line camelcase
          dislikes_attributes: dislikesAttrs,
        },
      });
      alert("更新しました");
      handleEditClose();
      // メンバー情報を再取得
      const res = await apiClient.get("/api/members");
      setMember(res.data);
      // 保存後リセット
      setRemovedLikeIds([]);
      setRemovedDislikeIds([]);
    } catch (error) {
      console.error("更新に失敗しました:", error);
      alert("更新に失敗しました");
    }
  };

  // 削除
  const handleDelete = async (m) => {
    const ownerUid = m.user?.firebase_uid || null;
    const isOwner = ownerUid ? currentUid === ownerUid : Boolean(currentUid);
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
    <div className="luxury-page">
      <AuthHeader />

      <div className="luxury-container">
        <h1 className="luxury-title">メンバー情報</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {member.map((m, idx) => {
            const ownerUid = m.user?.firebase_uid || null;
            const isOwner = ownerUid
              ? currentUid === ownerUid
              : Boolean(currentUid);

            return (
              <div key={`member-${idx}-${m.id}`} className="luxury-card">
                <h3
                  className="text-2xl font-medium mb-4 text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {m.name}
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="luxury-label text-base mb-2">
                      好きなもの
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {m.likes?.length > 0 ? (
                        m.likes.map((like) => (
                          <span
                            key={`likes-${m.id}-${like.id}`}
                            className="luxury-badge luxury-badge-primary"
                          >
                            {like.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted text-sm">未登録</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="luxury-label text-base mb-2">
                      嫌いなもの
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {m.dislikes?.length > 0 ? (
                        m.dislikes.map((dislike) => (
                          <span
                            key={`dislikes-${m.id}-${dislike.id}`}
                            className="luxury-badge luxury-badge-secondary"
                          >
                            {dislike.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted text-sm">未登録</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="luxury-label text-base mb-2">
                      提案したメニュー
                    </div>
                    <div className="flex flex-col gap-2">
                      {Array.isArray(m.menus) && m.menus.length > 0 ? (
                        m.menus.map((menu) => (
                          <div
                            key={`menu-${m.id}-${menu.id}`}
                            className="text-base"
                          >
                            • {menu.name}
                          </div>
                        ))
                      ) : m.menu && m.menu.name ? (
                        <div key={`menu-${m.id}`} className="text-base">
                          • {m.menu.name}
                        </div>
                      ) : (
                        <span className="text-muted text-sm">未提案</span>
                      )}
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border)]">
                    <button
                      onClick={() => handleEditOpen(m)}
                      className="luxury-btn luxury-btn-primary flex-1"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(m)}
                      className="luxury-btn luxury-btn-outline flex-1"
                      style={{
                        borderColor: "var(--secondary)",
                        color: "var(--secondary)",
                      }}
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 編集モーダル */}
      {isModalOpen && editingMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-hidden">
          <div className="luxury-card max-w-md w-full max-h-[80vh] flex flex-col animate-scale-in">
            <h2 className="luxury-label text-center mb-6 flex-shrink-0">
              {editName}さんを編集
            </h2>

            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              <div>
                <label className="luxury-label text-sm">名前</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="luxury-input"
                />
              </div>

              <div>
                <label className="luxury-label text-sm">好きなもの</label>
                {editLikes?.map((like, idx) => (
                  <div key={`edit-like-${idx}`} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={like.name}
                      onChange={(e) => {
                        const newLikes = [...editLikes];
                        newLikes[idx] = { ...like, name: e.target.value };
                        setEditLikes(newLikes);
                      }}
                      className="luxury-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const removed = editLikes[idx];
                        const newLikes = editLikes.filter((_, i) => i !== idx);
                        if (removed?.id) {
                          setRemovedLikeIds((prev) => [...prev, removed.id]);
                        }
                        setEditLikes(newLikes);
                      }}
                      className="px-4 py-2 bg-[var(--terracotta-100)] text-[var(--terracotta-600)] rounded-xl hover:bg-[var(--terracotta-200)] transition-colors font-medium text-sm"
                    >
                      削除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEditLikes([...editLikes, { name: "" }])}
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
                >
                  + 追加
                </button>
              </div>

              <div>
                <label className="luxury-label text-sm">嫌いなもの</label>
                {editDislikes?.map((dislike, idx) => (
                  <div key={`edit-dislike-${idx}`} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={dislike.name}
                      onChange={(e) => {
                        const newDislikes = [...editDislikes];
                        newDislikes[idx] = { ...dislike, name: e.target.value };
                        setEditDislikes(newDislikes);
                      }}
                      className="luxury-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const removed = editDislikes[idx];
                        const newDislikes = editDislikes.filter(
                          (_, i) => i !== idx,
                        );
                        if (removed?.id) {
                          setRemovedDislikeIds((prev) => [...prev, removed.id]);
                        }
                        setEditDislikes(newDislikes);
                      }}
                      className="px-4 py-2 bg-[var(--terracotta-100)] text-[var(--terracotta-600)] rounded-xl hover:bg-[var(--terracotta-200)] transition-colors font-medium text-sm"
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
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
                >
                  + 追加
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-8 flex-shrink-0">
              <button
                onClick={handleEditSave}
                className="luxury-btn luxury-btn-primary flex-1"
              >
                保存
              </button>
              <button
                onClick={handleEditClose}
                className="luxury-btn luxury-btn-ghost flex-1"
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
