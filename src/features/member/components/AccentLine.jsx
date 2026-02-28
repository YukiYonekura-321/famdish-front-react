/** グラデーション付きアクセントライン */
export function AccentLine({ colors }) {
  return (
    <div
      className="h-1"
      style={{ background: `linear-gradient(90deg, ${colors})` }}
    />
  );
}
