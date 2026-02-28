// ── ナビゲーション項目の共通定義 ──
// AuthHeader（デスクトップ）と MobileAuthMenuItems（モバイル）で共有

export const NAV_ITEMS = [
  { href: "/members", icon: "💌", label: "家族を招待" },
  { href: "/members/index", icon: "👥", label: "メンバー一覧" },
  { href: "/request", icon: "📝", label: "リクエスト" },
  { href: "/menus", icon: "📋", label: "メニュー提案" },
  { href: "/menus/familysuggestion", icon: "🏠", label: "わが家の献立" },
  { href: "/stock", icon: "🧊", label: "冷蔵庫" },
];

export const MYPAGE_LINKS = [
  { href: "/mypage/invite", icon: "👨‍👩‍👧‍👦", label: "ログインできない家族を登録" },
  { href: "/mypage/social", icon: "🔗", label: "ソーシャルアカウント連携状態" },
  { href: "/mypage/email", icon: "✉️", label: "通知先メールアドレス変更" },
];
