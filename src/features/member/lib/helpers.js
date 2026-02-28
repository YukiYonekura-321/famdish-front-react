// features/member - ヘルパー関数

/** 有効期限の日時フォーマット */
export function formatExpiresAt(dateString) {
  return new Date(dateString).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** メンバーの所有権判定 */
export const checkOwnership = (member, currentUid) => {
  const ownerUid = member.user?.firebase_uid || null;
  return ownerUid ? currentUid === ownerUid : Boolean(currentUid);
};

/** Rails の nested_attributes 用に likes/dislikes を整形 */
export const buildNestedAttrs = (items, removedIds) => [
  ...items.map((item) =>
    item.id ? { id: item.id, name: item.name } : { name: item.name },
  ),
  ...removedIds.map((id) => ({ id, _destroy: true })),
];
