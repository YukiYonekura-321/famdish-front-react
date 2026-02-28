// features/stock - 定数

/** よく使う食材の定義 */
export const PRESET_INGREDIENTS = [
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

/** カテゴリ定義（select の optgroup に対応） */
export const INGREDIENT_CATEGORIES = [
  {
    label: "🥩 肉・魚",
    names: [
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
    ],
  },
  {
    label: "🥬 野菜",
    names: [
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
    ],
  },
  { label: "🍄 きのこ", names: ["しめじ", "えのき"] },
  {
    label: "🥚 卵・乳製品・大豆",
    names: ["卵", "牛乳", "バター", "チーズ", "ヨーグルト", "豆腐", "納豆"],
  },
  { label: "🍚 主食・粉類", names: ["米", "パン", "小麦粉", "片栗粉"] },
  {
    label: "🫙 調味料・油",
    names: [
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
    ],
  },
];

/** デフォルト数量選択肢 */
export const DEFAULT_QUANTITIES = [
  1, 2, 3, 4, 5, 10, 15, 20, 50, 100, 200, 300, 500,
];

/** 単位選択肢 */
export const UNIT_OPTIONS = [
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

/** 共通入力スタイル */
export const inputClassName =
  "w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-white/80 backdrop-blur-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sage-400)] focus:border-transparent transition-all duration-300";
