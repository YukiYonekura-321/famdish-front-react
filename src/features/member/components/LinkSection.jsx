import { CARD_CLASS, CARD_STYLE } from "@/features/member/constants";
import { AccentLine } from "./AccentLine";

/** リンクセクション */
export function LinkSection({ inviteUrl, copied, onCopy }) {
  return (
    <div className={CARD_CLASS} style={CARD_STYLE}>
      <AccentLine colors="var(--gold-400), var(--terracotta-400)" />
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📋</span>
          <h3
            className="text-2xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            招待リンク
          </h3>
        </div>
        <input
          type="text"
          value={inviteUrl}
          readOnly
          className="w-full px-5 py-4 bg-[var(--cream-100)] border-2 border-[var(--border)]
                     rounded-2xl text-sm font-mono text-[var(--foreground)]
                     focus:outline-none focus:border-[var(--gold-400)] transition-colors"
          onClick={(e) => e.target.select()}
        />
        <button
          onClick={onCopy}
          className="group relative w-full mt-6 overflow-hidden"
        >
          <span
            className="relative z-10 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl
                       font-medium transition-all duration-300 group-hover:scale-105"
            style={{
              background: copied
                ? "linear-gradient(135deg, var(--sage-500), var(--sage-600))"
                : "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
              color: "white",
              boxShadow: copied
                ? "0 6px 20px rgba(90, 122, 90, 0.3)"
                : "0 6px 20px rgba(212, 175, 55, 0.3)",
            }}
          >
            <span className="text-xl">{copied ? "✓" : "📋"}</span>
            <span>{copied ? "コピーしました" : "リンクをコピー"}</span>
          </span>
          <span
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                       transition-opacity duration-500 blur-xl"
            style={{
              background:
                "linear-gradient(135deg, var(--gold-400), var(--gold-600))",
            }}
          />
        </button>
      </div>
    </div>
  );
}
