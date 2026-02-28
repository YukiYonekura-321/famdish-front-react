// features/auth - リダイレクトユーティリティ

/** リダイレクト先がアプリ内の安全なパスか検証 */
export const isValidRedirectPath = (path) => {
  if (!path) return false;
  // 外部 URL や プロトコル付きは拒否
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//")
  ) {
    return false;
  }
  // アプリ内パス（/で始まる）のみ許可
  return path.startsWith("/");
};

/** redirectParam を含むログインURLを生成するヘルパー */
export function buildLoginUrl(redirectParam, extras = "") {
  const base = redirectParam
    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
    : "/login";
  return extras ? `${base}${extras}` : base;
}
