"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/app/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthHeader } from "@/components/auth_header";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── ヘルパー関数 ──

/** メンバーの所有権判定 */
const checkOwnership = (member, currentUid) => {
  const ownerUid = member.user?.firebase_uid || null;
  return ownerUid ? currentUid === ownerUid : Boolean(currentUid);
};

/** Rails の nested_attributes 用に likes/dislikes を整形 */
const buildNestedAttrs = (items, removedIds) => [
  ...items.map((item) =>
    item.id ? { id: item.id, name: item.name } : { name: item.name },
  ),
  ...removedIds.map((id) => ({ id, _destroy: true })),
];

// ── 編集リストコンポーネント（likes / dislikes 共通） ──

function EditableList({ label, items, setItems, setRemovedIds }) {
  const handleChange = (idx, value) => {
    const updated = [...items];
    updated[idx] = { ...items[idx], name: value };
    setItems(updated);
  };

  const handleRemove = (idx) => {
    const removed = items[idx];
    if (removed?.id) setRemovedIds((prev) => [...prev, removed.id]);
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="luxury-label text-sm">{label}</label>
      {items.map((item, idx) => (
        <div key={`edit-${label}-${idx}`} className="flex gap-2 mb-3">
          <input
            type="text"
            value={item.name}
            onChange={(e) => handleChange(idx, e.target.value)}
            className="luxury-input flex-1"
          />
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            className="px-4 py-2 bg-[var(--terracotta-100)] text-[var(--terracotta-600)] rounded-xl hover:bg-[var(--terracotta-200)] transition-colors font-medium text-sm"
          >
            削除
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems([...items, { name: "" }])}
        className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
      >
        + 追加
      </button>
    </div>
  );
}

// ── バッジリストコンポーネント（カード内の表示用） ──

function BadgeList({ items, memberId, variant, emptyText }) {
  if (!items?.length) {
    return <span className="text-muted text-sm">{emptyText}</span>;
  }
  return items.map((item) => (
    <span
      key={`${variant}-${memberId}-${item.id}`}
      className={`luxury-badge luxury-badge-${variant}`}
    >
      {item.name}
    </span>
  ));
}

// ── メニューリストコンポーネント ──

function MenuList({ member }) {
  if (Array.isArray(member.menus) && member.menus.length > 0) {
    return member.menus.map((menu) => (
      <div key={`menu-${member.id}-${menu.id}`} className="text-base">
        • {menu.name}
      </div>
    ));
  }
  if (member.menu?.name) {
    return <div className="text-base">• {member.menu.name}</div>;
  }
  return <span className="text-muted text-sm">未提案</span>;
}

// ── メインコンポーネント ──

export default function MemberForm() {
  const [currentUid, setCurrentUid] = useState(null);
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLikes, setEditLikes] = useState([]);
  const [editDislikes, setEditDislikes] = useState([]);
  const [removedLikeIds, setRemovedLikeIds] = useState([]);
  const [removedDislikeIds, setRemovedDislikeIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // ── メンバー一覧取得（共通） ──
  const fetchMembers = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/members");
      setMembers(res.data);
    } catch (error) {
      console.error("メンバーの取得に失敗しました:", error);
    }
  }, []);

  // ── 認証監視 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUid(user.uid);
      } else {
        setCurrentUid(null);
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── 認証後にメンバー取得 ──
  useEffect(() => {
    if (currentUid) fetchMembers();
  }, [currentUid, fetchMembers]);

  // ── 編集モーダルを開く ──
  const handleEditOpen = (m) => {
    if (!checkOwnership(m, currentUid)) {
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

  // ── 編集モーダルを閉じる ──
  const handleEditClose = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setRemovedLikeIds([]);
    setRemovedDislikeIds([]);
  };

  // ── 編集を保存 ──
  const handleEditSave = async () => {
    if (!editingMember) return;
    try {
      /* eslint-disable camelcase */
      await apiClient.put(`/api/members/${editingMember.id}`, {
        member: {
          name: editName,
          likes_attributes: buildNestedAttrs(editLikes, removedLikeIds),
          dislikes_attributes: buildNestedAttrs(
            editDislikes,
            removedDislikeIds,
          ),
        },
      });
      /* eslint-enable camelcase */
      alert("更新しました");
      handleEditClose();
      await fetchMembers();
    } catch (error) {
      console.error("更新に失敗しました:", error);
      alert("更新に失敗しました");
    }
  };

  // ── 削除 ──
  const handleDelete = async (m) => {
    if (!checkOwnership(m, currentUid)) {
      alert("このメンバーを削除する権限がありません。");
      return;
    }
    if (!confirm(`${m.name}さんを削除してよろしいですか？`)) return;
    try {
      await apiClient.delete(`/api/members/${m.id}`);
      alert("削除しました");
      await fetchMembers();
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

        {/* ─── ナビゲーションボタン ─── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 max-w-2xl mx-auto">
          <Link
            href="/request"
            className="luxury-btn luxury-btn-secondary flex items-center justify-center gap-2"
          >
            <span>📝</span>
            <span>リクエスト管理</span>
          </Link>
          <Link
            href="/stock"
            className="luxury-btn luxury-btn-outline flex items-center justify-center gap-2"
          >
            <span>🧊</span>
            <span>冷蔵庫</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {members.map((m) => {
            const isOwner = checkOwnership(m, currentUid);
            return (
              <div key={m.id} className="luxury-card">
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
                      <BadgeList
                        items={m.likes}
                        memberId={m.id}
                        variant="primary"
                        emptyText="未登録"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="luxury-label text-base mb-2">
                      嫌いなもの
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <BadgeList
                        items={m.dislikes}
                        memberId={m.id}
                        variant="secondary"
                        emptyText="未登録"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="luxury-label text-base mb-2">
                      提案したメニュー
                    </div>
                    <div className="flex flex-col gap-2">
                      <MenuList member={m} />
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

      {/* ── 編集モーダル ── */}
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

              <EditableList
                label="好きなもの"
                items={editLikes}
                setItems={setEditLikes}
                removedIds={removedLikeIds}
                setRemovedIds={setRemovedLikeIds}
              />

              <EditableList
                label="嫌いなもの"
                items={editDislikes}
                setItems={setEditDislikes}
                removedIds={removedDislikeIds}
                setRemovedIds={setRemovedDislikeIds}
              />
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
