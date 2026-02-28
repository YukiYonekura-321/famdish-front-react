/** ファミリー情報バッジ */
export function FamilyInfoBadge({ familyName }) {
  if (!familyName) return null;
  return (
    <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up stagger-1">
      <div
        className="backdrop-blur-xl bg-gradient-to-br from-white/70 to-white/50
                   border border-[var(--gold-400)]/20 rounded-3xl p-6 shadow-xl"
        style={{
          boxShadow:
            "0 12px 40px rgba(212, 175, 55, 0.12), 0 4px 16px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--sage-400)] to-[var(--sage-600)] flex items-center justify-center text-2xl shadow-lg">
            🏠
          </div>
          <div className="flex-1">
            <div
              className="text-sm text-[var(--muted)] mb-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Your Family
            </div>
            <div
              className="text-2xl font-medium text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {familyName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
