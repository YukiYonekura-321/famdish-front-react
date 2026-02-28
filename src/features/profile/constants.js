// features/profile - 定数

/** プロフィール登録の総ステップ数 */
export const TOTAL_STEPS = 7;

/** ステップ1 - 機能紹介カード情報 */
export const STEP1_FEATURES = [
  {
    icon: "🏠",
    title: "家族向け",
    desc: "ご家族みんなの好みに対応",
    bg: "bg-[var(--sage-50)]",
    border: "border-[var(--sage-200)]",
  },
  {
    icon: "🎯",
    title: "パーソナライズ",
    desc: "あなたの好みにぴったり合う",
    bg: "bg-[var(--terracotta-50)]",
    border: "border-[var(--terracotta-200)]",
  },
  {
    icon: "✨",
    title: "簡単・便利",
    desc: "すぐに使えるシンプル設計",
    bg: "bg-[var(--gold-50)]",
    border: "border-[var(--gold-200)]",
  },
];

/** ステップ1-2 - メール確認メッセージ */
export const CONFIRM_MSG = (email) =>
  `${email}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`;

/** ステップ3-1 - 好きな食べ物オプション */
export const LIKE_OPTIONS = [
  "唐揚げ",
  "カレーライス",
  "ラーメン",
  "餃子",
  "肉じゃが",
  "ハンバーグ",
  "焼き肉",
  "すき焼き",
  "天ぷら",
  "お寿司",
  "焼き魚",
  "親子丼",
  "オムライス",
  "焼きそば",
  "チキン南蛮",
  "チャーハン",
  "麻婆豆腐",
  "鍋料理",
  "グラタン",
  "お好み焼き",
];

/** ステップ3-2 - 嫌いな食べ物オプション */
export const DISLIKE_OPTIONS = [
  "にんじん",
  "ピーマン",
  "トマト",
  "納豆",
  "辛いもの",
  "苦いもの",
  "生魚",
  "シーフード",
  "チーズ",
  "卵料理",
  "揚げ物",
  "味の濃い物",
  "香辛料",
  "豆腐",
  "海藻",
  "レバー",
  "内臓系",
  "きのこ",
  "牛肉",
  "豚肉",
];
