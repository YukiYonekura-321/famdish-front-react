// features/menu - 定数

/** 予算オプション */
export const BUDGET_OPTIONS = [
  300, 500, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000,
];

/** 調理時間オプション */
export const COOKING_TIME_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120];

/** 提案日数オプション */
export const DAYS_OPTIONS = [2, 3, 4, 5, 6, 7];

/** メニュー提案ページのナビリンク */
export const MENU_NAV_LINKS = [
  {
    href: "/menus/familysuggestion",
    icon: "🏠",
    label: "わが家の献立",
    variant: "secondary",
  },
  {
    href: "/menus/familysuggestion/suggestion",
    icon: "🌍",
    label: "みんなの献立を参考にする",
    variant: "outline",
  },
  {
    href: "/request",
    icon: "📝",
    label: "リクエスト管理",
    variant: "secondary",
  },
];

/** 家族献立ページのナビリンク */
export const FAMILY_NAV_LINKS = [
  {
    href: "/menus/familysuggestion/suggestion",
    icon: "🌍",
    label: "みんなの献立を参考にする",
    variant: "outline",
  },
  {
    href: "/menus",
    icon: "🍽️",
    label: "メニュー提案ページへ戻る",
    variant: "secondary",
  },
];
