import { formatExpiresAt, checkOwnership, buildNestedAttrs } from "../helpers";

describe("formatExpiresAt", () => {
  it("日時文字列を日本語フォーマットで返す", () => {
    const result = formatExpiresAt("2026-03-07T15:30:00Z");
    // タイムゾーンに依存するため、年・月・日がふくまれていることを確認
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/3/);
    expect(result).toMatch(/[78]/); // UTC→JST で 7 日か 8 日
  });
});

describe("checkOwnership", () => {
  it("firebase_uid が一致するとき true を返す", () => {
    const member = { user: { firebase_uid: "uid-123" } };
    expect(checkOwnership(member, "uid-123")).toBe(true);
  });

  it("firebase_uid が不一致のとき false を返す", () => {
    const member = { user: { firebase_uid: "uid-123" } };
    expect(checkOwnership(member, "uid-999")).toBe(false);
  });

  it("user が null のとき currentUid があれば true を返す", () => {
    const member = { user: null };
    expect(checkOwnership(member, "uid-123")).toBe(true);
  });

  it("user が null かつ currentUid も falsy なら false を返す", () => {
    const member = { user: null };
    expect(checkOwnership(member, "")).toBe(false);
  });

  it("user.firebase_uid が null の場合、currentUid の真偽値で判定", () => {
    const member = { user: { firebase_uid: null } };
    expect(checkOwnership(member, "uid-123")).toBe(true);
    expect(checkOwnership(member, "")).toBe(false);
  });
});

describe("buildNestedAttrs", () => {
  it("新規アイテムは name のみ含める", () => {
    const items = [{ name: "milk" }];
    const removedIds = [];
    expect(buildNestedAttrs(items, removedIds)).toEqual([{ name: "milk" }]);
  });

  it("既存アイテムは id と name を含める", () => {
    const items = [{ id: 1, name: "egg" }];
    const removedIds = [];
    expect(buildNestedAttrs(items, removedIds)).toEqual([
      { id: 1, name: "egg" },
    ]);
  });

  it("削除対象は _destroy: true を付与する", () => {
    const items = [];
    const removedIds = [5, 7];
    expect(buildNestedAttrs(items, removedIds)).toEqual([
      { id: 5, _destroy: true },
      { id: 7, _destroy: true },
    ]);
  });

  it("追加・更新・削除を混合で処理する", () => {
    const items = [{ id: 1, name: "egg" }, { name: "milk" }];
    const removedIds = [3];
    expect(buildNestedAttrs(items, removedIds)).toEqual([
      { id: 1, name: "egg" },
      { name: "milk" },
      { id: 3, _destroy: true },
    ]);
  });
});
