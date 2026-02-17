"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";
import { AuthHeader } from "@/components/auth_header";

// ── よく使う食材の定義 ──
// name: 食材名, unit: デフォルト単位, quantities: 選択可能な量
const PRESET_INGREDIENTS = [
  { name: "卵", unit: "個", quantities: [1, 2, 3, 4, 5, 6, 8, 10, 12] },
  { name: "牛乳", unit: "ml", quantities: [100, 200, 300, 500, 1000] },
  { name: "米", unit: "合", quantities: [1, 2, 3, 4, 5, 10] },
  { name: "パン", unit: "枚", quantities: [1, 2, 3, 4, 5, 6] },
  {
    name: "鶏もも肉",
    unit: "g",
    quantities: [100, 150, 200, 250, 300, 400, 500],
  },
  {
    name: "鶏むね肉",
    unit: "g",
    quantities: [100, 150, 200, 250, 300, 400, 500],
  },
  {
    name: "豚バラ肉",
    unit: "g",
    quantities: [100, 150, 200, 250, 300, 400, 500],
  },
  {
    name: "豚こま肉",
    unit: "g",
    quantities: [100, 150, 200, 250, 300, 400, 500],
  },
  { name: "牛肉", unit: "g", quantities: [100, 150, 200, 250, 300, 400, 500] },
  {
    name: "ひき肉",
    unit: "g",
    quantities: [100, 150, 200, 250, 300, 400, 500],
  },
  { name: "鮭", unit: "切", quantities: [1, 2, 3, 4] },
  { name: "サバ", unit: "切", quantities: [1, 2, 3, 4] },
  { name: "エビ", unit: "尾", quantities: [3, 5, 8, 10, 15, 20] },
  { name: "豆腐", unit: "丁", quantities: [1, 2, 3] },
  { name: "納豆", unit: "パック", quantities: [1, 2, 3, 4] },
  { name: "玉ねぎ", unit: "個", quantities: [1, 2, 3, 4, 5] },
  { name: "にんじん", unit: "本", quantities: [1, 2, 3, 4, 5] },
  { name: "じゃがいも", unit: "個", quantities: [1, 2, 3, 4, 5] },
  { name: "キャベツ", unit: "玉", quantities: [0.5, 1, 2] },
  { name: "もやし", unit: "袋", quantities: [1, 2, 3] },
  { name: "トマト", unit: "個", quantities: [1, 2, 3, 4, 5] },
  { name: "ほうれん草", unit: "束", quantities: [1, 2, 3] },
  { name: "小松菜", unit: "束", quantities: [1, 2, 3] },
  { name: "ピーマン", unit: "個", quantities: [1, 2, 3, 4, 5] },
  { name: "きゅうり", unit: "本", quantities: [1, 2, 3, 4, 5] },
  { name: "長ねぎ", unit: "本", quantities: [1, 2, 3] },
  { name: "なす", unit: "本", quantities: [1, 2, 3, 4, 5] },
  { name: "大根", unit: "本", quantities: [0.5, 1, 2] },
  { name: "白菜", unit: "玉", quantities: [0.25, 0.5, 1] },
  { name: "しめじ", unit: "パック", quantities: [1, 2, 3] },
  { name: "えのき", unit: "袋", quantities: [1, 2, 3] },
  { name: "バター", unit: "g", quantities: [10, 20, 30, 50, 100, 200] },
  { name: "チーズ", unit: "g", quantities: [50, 100, 150, 200, 300] },
  { name: "ヨーグルト", unit: "g", quantities: [100, 200, 300, 400, 500] },
  { name: "味噌", unit: "g", quantities: [100, 200, 300, 500, 750] },
  { name: "醤油", unit: "ml", quantities: [100, 200, 300, 500, 1000] },
  { name: "みりん", unit: "ml", quantities: [100, 200, 300, 500] },
  { name: "料理酒", unit: "ml", quantities: [100, 200, 300, 500] },
  { name: "サラダ油", unit: "ml", quantities: [100, 200, 300, 500] },
  { name: "ごま油", unit: "ml", quantities: [50, 100, 150, 200] },
  { name: "オリーブオイル", unit: "ml", quantities: [50, 100, 200, 300, 500] },
  { name: "小麦粉", unit: "g", quantities: [100, 200, 300, 500, 1000] },
  { name: "片栗粉", unit: "g", quantities: [50, 100, 150, 200, 300] },
  { name: "砂糖", unit: "g", quantities: [100, 200, 300, 500, 1000] },
  { name: "塩", unit: "g", quantities: [50, 100, 200, 300, 500] },
  { name: "マヨネーズ", unit: "g", quantities: [100, 200, 300, 500] },
  { name: "ケチャップ", unit: "g", quantities: [100, 200, 300, 500] },
  { name: "ウインナー", unit: "本", quantities: [2, 3, 4, 5, 6, 8, 10] },
  { name: "ベーコン", unit: "枚", quantities: [2, 3, 4, 5, 6, 8] },
  { name: "ハム", unit: "枚", quantities: [2, 3, 4, 5, 6, 8] },
];

// カスタム食材用のデフォルト量選択肢
const DEFAULT_QUANTITIES = [1, 2, 3, 4, 5, 10, 15, 20, 50, 100, 200, 300, 500];
const UNIT_OPTIONS = [
  "個",
  "g",
  "ml",
  "本",
  "枚",
  "袋",
  "パック",
  "切",
  "束",
  "丁",
  "玉",
  "尾",
  "合",
];

export default function StockPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ── 追加フォーム ──
  const [selectedPreset, setSelectedPreset] = useState("");
  const [customName, setCustomName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── 編集用 ──
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");

  // 現在選ばれている食材のプリセット情報
  const currentPreset = PRESET_INGREDIENTS.find(
    (p) => p.name === selectedPreset,
  );
  const isCustom = selectedPreset === "__custom__";
  const currentName = isCustom ? customName : selectedPreset;
  const currentUnit = isCustom ? unit : currentPreset?.unit || "";
  const currentQuantities = isCustom
    ? DEFAULT_QUANTITIES
    : currentPreset?.quantities || DEFAULT_QUANTITIES;

  // ── 認証 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      fetchStocks();
    });
    return () => unsubscribe();
  }, [router]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/stocks");
      setStocks(res.data);
    } catch (err) {
      console.error("在庫取得エラー:", err);
      setError("在庫の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // ── 追加 ──
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!currentName || !quantity || !currentUnit) {
      setError("食材名・量・単位をすべて入力してください");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await apiClient.post("/api/stocks", {
        stock: {
          name: currentName,
          quantity: Number(quantity),
          unit: currentUnit,
        },
      });
      setStocks((prev) =>
        [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      // フォームリセット
      setSelectedPreset("");
      setCustomName("");
      setQuantity("");
      setUnit("");
      showSuccess(`${res.data.name} を追加しました`);
    } catch (err) {
      console.error("追加エラー:", err);
      setError(err.response?.data?.error || "食材の追加に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  // ── 更新 ──
  const handleUpdate = async (id) => {
    if (!editQuantity) return;
    setError("");
    try {
      const res = await apiClient.patch(`/api/stocks/${id}`, {
        stock: { quantity: Number(editQuantity) },
      });
      setStocks((prev) => prev.map((s) => (s.id === id ? res.data : s)));
      setEditingId(null);
      setEditQuantity("");
      showSuccess("数量を更新しました");
    } catch (err) {
      console.error("更新エラー:", err);
      setError(err.response?.data?.error || "更新に失敗しました");
    }
  };

  // ── 削除 ──
  const handleDelete = async (id, name) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    setError("");
    try {
      await apiClient.delete(`/api/stocks/${id}`);
      setStocks((prev) => prev.filter((s) => s.id !== id));
      showSuccess(`${name} を削除しました`);
    } catch (err) {
      console.error("削除エラー:", err);
      setError(err.response?.data?.error || "削除に失敗しました");
    }
  };

  // プリセット変更時に単位を自動セット
  const handlePresetChange = (value) => {
    setSelectedPreset(value);
    setQuantity("");
    if (value === "__custom__") {
      setCustomName("");
      setUnit("");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <AuthHeader />

      {/* Ambient background with organic shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 30% 20%, rgba(217, 112, 72, 0.08), transparent),
              radial-gradient(ellipse 70% 50% at 70% 80%, rgba(90, 122, 90, 0.08), transparent),
              radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05), transparent 70%)
            `,
          }}
        ></div>
        <div
          className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--sage-300), transparent 70%)",
            animationDuration: "8s",
          }}
        ></div>
        <div
          className="absolute bottom-32 right-20 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--terracotta-300), transparent 70%)",
            animationDuration: "10s",
            animationDelay: "2s",
          }}
        ></div>
      </div>

      <div className="relative luxury-page pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full backdrop-blur-md bg-white/40 border border-[var(--gold-400)]/30">
              <span className="text-2xl">🧊</span>
              <span
                className="text-sm font-medium text-[var(--gold-600)] tracking-wide"
                style={{ fontFamily: "var(--font-body)" }}
              >
                FAMILY STOCK
              </span>
            </div>

            <h1
              className="text-5xl md:text-7xl font-light text-[var(--foreground)] mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              冷蔵庫の中身
            </h1>

            <p
              className="text-xl text-[var(--warm-gray-500)] max-w-2xl mx-auto leading-relaxed text-center"
              style={{ fontFamily: "var(--font-body)", textAlign: "center" }}
            >
              家族の冷蔵庫にある食材を管理しましょう。
              <br />
              在庫を共有して、無駄のない食生活を。
            </p>

            {/* Decorative line */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[var(--gold-400)]"></div>
              <div className="w-2 h-2 rounded-full bg-[var(--gold-400)]"></div>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[var(--gold-400)]"></div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div
              className="max-w-2xl mx-auto mb-8 backdrop-blur-xl bg-gradient-to-br from-[var(--sage-50)] to-white/80
                       border-2 border-[var(--sage-300)] rounded-3xl p-6 animate-scale-in"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">✅</span>
                <p
                  className="font-medium text-[var(--sage-600)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="max-w-2xl mx-auto mb-8 backdrop-blur-xl bg-gradient-to-br from-[var(--terracotta-50)] to-white/80
                       border-2 border-[var(--terracotta-300)] rounded-3xl p-6 animate-scale-in"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div
                    className="font-medium text-[var(--terracotta-600)] mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    エラーが発生しました
                  </div>
                  <p className="text-sm text-[var(--terracotta-600)]">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ────────── 食材追加フォーム ────────── */}
          <div className="max-w-2xl mx-auto mb-16 animate-fade-in-up stagger-1">
            <div
              className="backdrop-blur-xl bg-gradient-to-br from-white/70 to-white/50
                       border border-[var(--gold-400)]/20 rounded-3xl p-8 shadow-xl"
              style={{
                boxShadow:
                  "0 12px 40px rgba(212, 175, 55, 0.12), 0 4px 16px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h2
                className="text-2xl font-medium text-[var(--foreground)] mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                🛒 食材を追加
              </h2>

              <form onSubmit={handleAdd} className="space-y-5">
                {/* 食材選択 */}
                <div>
                  <label
                    className="block text-sm font-medium text-[var(--warm-gray-600)] mb-2"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    食材を選択
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border)]
                             bg-white/80 backdrop-blur-sm text-[var(--foreground)]
                             focus:outline-none focus:ring-2 focus:ring-[var(--sage-400)] focus:border-transparent
                             transition-all duration-300"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <option value="">-- 食材を選んでください --</option>
                    <optgroup label="🥩 肉・魚">
                      {PRESET_INGREDIENTS.filter((p) =>
                        [
                          "鶏もも肉",
                          "鶏むね肉",
                          "豚バラ肉",
                          "豚こま肉",
                          "牛肉",
                          "ひき肉",
                          "鮭",
                          "サバ",
                          "エビ",
                          "ウインナー",
                          "ベーコン",
                          "ハム",
                        ].includes(p.name),
                      ).map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}（{p.unit}）
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🥬 野菜">
                      {PRESET_INGREDIENTS.filter((p) =>
                        [
                          "玉ねぎ",
                          "にんじん",
                          "じゃがいも",
                          "キャベツ",
                          "もやし",
                          "トマト",
                          "ほうれん草",
                          "小松菜",
                          "ピーマン",
                          "きゅうり",
                          "長ねぎ",
                          "なす",
                          "大根",
                          "白菜",
                        ].includes(p.name),
                      ).map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}（{p.unit}）
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🍄 きのこ">
                      {PRESET_INGREDIENTS.filter((p) =>
                        ["しめじ", "えのき"].includes(p.name),
                      ).map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}（{p.unit}）
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🥚 卵・乳製品・大豆">
                      {PRESET_INGREDIENTS.filter((p) =>
                        [
                          "卵",
                          "牛乳",
                          "バター",
                          "チーズ",
                          "ヨーグルト",
                          "豆腐",
                          "納豆",
                        ].includes(p.name),
                      ).map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}（{p.unit}）
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🍚 主食・粉類">
                      {PRESET_INGREDIENTS.filter((p) =>
                        ["米", "パン", "小麦粉", "片栗粉"].includes(p.name),
                      ).map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}（{p.unit}）
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🫙 調味料・油">
                      {PRESET_INGREDIENTS.filter((p) =>
                        [
                          "味噌",
                          "醤油",
                          "みりん",
                          "料理酒",
                          "砂糖",
                          "塩",
                          "サラダ油",
                          "ごま油",
                          "オリーブオイル",
                          "マヨネーズ",
                          "ケチャップ",
                        ].includes(p.name),
                      ).map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}（{p.unit}）
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="✏️ その他">
                      <option value="__custom__">自分で入力する</option>
                    </optgroup>
                  </select>
                </div>

                {/* カスタム食材名入力（「自分で入力する」選択時のみ） */}
                {isCustom && (
                  <div className="animate-fade-in">
                    <label
                      className="block text-sm font-medium text-[var(--warm-gray-600)] mb-2"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      食材名
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="例：アボカド"
                      className="w-full px-4 py-3 rounded-2xl border border-[var(--border)]
                               bg-white/80 backdrop-blur-sm text-[var(--foreground)]
                               focus:outline-none focus:ring-2 focus:ring-[var(--sage-400)] focus:border-transparent
                               transition-all duration-300 placeholder:text-[var(--warm-gray-400)]"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>
                )}

                {/* 量と単位 */}
                {selectedPreset && selectedPreset !== "" && (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    {/* 量 */}
                    <div>
                      <label
                        className="block text-sm font-medium text-[var(--warm-gray-600)] mb-2"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        量
                      </label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-[var(--border)]
                                 bg-white/80 backdrop-blur-sm text-[var(--foreground)]
                                 focus:outline-none focus:ring-2 focus:ring-[var(--sage-400)] focus:border-transparent
                                 transition-all duration-300"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <option value="">-- 量を選択 --</option>
                        {currentQuantities.map((q) => (
                          <option key={q} value={q}>
                            {q} {currentUnit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 単位（カスタム時のみ編集可能） */}
                    <div>
                      <label
                        className="block text-sm font-medium text-[var(--warm-gray-600)] mb-2"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        単位
                      </label>
                      {isCustom ? (
                        <select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-[var(--border)]
                                   bg-white/80 backdrop-blur-sm text-[var(--foreground)]
                                   focus:outline-none focus:ring-2 focus:ring-[var(--sage-400)] focus:border-transparent
                                   transition-all duration-300"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          <option value="">-- 単位を選択 --</option>
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div
                          className="w-full px-4 py-3 rounded-2xl border border-[var(--border)]
                                   bg-[var(--cream-100)] text-[var(--foreground)] font-medium"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {currentUnit}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 追加ボタン */}
                <button
                  type="submit"
                  disabled={
                    submitting || !currentName || !quantity || !currentUnit
                  }
                  className="luxury-btn luxury-btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      追加中...
                    </span>
                  ) : (
                    <span>🛒 食材を追加する</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ────────── 在庫一覧 ────────── */}
          <div className="max-w-4xl mx-auto animate-fade-in-up stagger-2">
            <h2
              className="text-3xl font-medium text-[var(--foreground)] mb-8 text-center"
              style={{ fontFamily: "var(--font-display)" }}
            >
              📦 現在の在庫
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="luxury-spinner"></div>
              </div>
            ) : stocks.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-6xl block mb-4">🧊</span>
                <p
                  className="text-xl text-[var(--warm-gray-400)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  まだ食材が登録されていません
                </p>
                <p
                  className="text-sm text-[var(--warm-gray-400)] mt-2"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  上のフォームから食材を追加してみましょう
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="backdrop-blur-xl bg-gradient-to-br from-white/70 to-white/50
                             border border-[var(--border)] rounded-2xl p-5 shadow-md
                             hover:shadow-lg hover:border-[var(--gold-400)]/30
                             transition-all duration-300"
                  >
                    {editingId === stock.id ? (
                      /* ── 編集モード ── */
                      <div className="space-y-3">
                        <div
                          className="font-medium text-lg text-[var(--foreground)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {stock.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)]
                                     bg-white/80 text-[var(--foreground)] text-center
                                     focus:outline-none focus:ring-2 focus:ring-[var(--sage-400)]"
                            min="0"
                            step="any"
                          />
                          <span
                            className="text-sm font-medium text-[var(--warm-gray-500)] min-w-[3rem]"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {stock.unit}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(stock.id)}
                            className="flex-1 px-3 py-2 rounded-xl bg-[var(--sage-500)] text-white text-sm
                                     font-medium hover:bg-[var(--sage-600)] transition-colors duration-200"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditQuantity("");
                            }}
                            className="flex-1 px-3 py-2 rounded-xl bg-[var(--warm-gray-200)] text-[var(--warm-gray-600)]
                                     text-sm font-medium hover:bg-[var(--warm-gray-300)] transition-colors duration-200"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── 表示モード ── */
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="font-medium text-lg text-[var(--foreground)]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {stock.name}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span
                            className="text-3xl font-semibold text-[var(--sage-600)]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {stock.quantity}
                          </span>
                          <span
                            className="text-sm text-[var(--warm-gray-500)]"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {stock.unit}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(stock.id);
                              setEditQuantity(String(stock.quantity));
                            }}
                            className="flex-1 px-3 py-2 rounded-xl border border-[var(--sage-400)]
                                     text-[var(--sage-600)] text-sm font-medium
                                     hover:bg-[var(--sage-50)] transition-colors duration-200"
                          >
                            ✏️ 数量変更
                          </button>
                          <button
                            onClick={() => handleDelete(stock.id, stock.name)}
                            className="px-3 py-2 rounded-xl border border-[var(--terracotta-300)]
                                     text-[var(--terracotta-500)] text-sm font-medium
                                     hover:bg-[var(--terracotta-50)] transition-colors duration-200"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
