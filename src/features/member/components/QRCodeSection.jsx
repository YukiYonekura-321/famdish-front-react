import { QRCodeCanvas } from "qrcode.react";
import { AccentLine } from "./AccentLine";
import { CARD_CLASS, CARD_STYLE } from "@/features/member/constants";

/** QRコードセクション */
export function QRCodeSection({ inviteUrl, qrCodeRef, onDownload }) {
  return (
    <div className={CARD_CLASS} style={CARD_STYLE}>
      <AccentLine colors="var(--sage-400), var(--gold-400)" />
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📱</span>
          <h3
            className="text-2xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            QRコード
          </h3>
        </div>
        <div className="flex flex-col items-center">
          <div
            ref={qrCodeRef}
            className="relative p-6 bg-white rounded-3xl border-2 border-[var(--gold-400)]/20 shadow-lg"
            style={{
              boxShadow:
                "0 8px 24px rgba(212, 175, 55, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
            }}
          >
            {/* Decorative corners */}
            {["tl", "tr", "bl", "br"].map((pos) => (
              <div
                key={pos}
                className={`absolute ${pos.includes("t") ? "top-0" : "bottom-0"} ${pos.includes("l") ? "left-0" : "right-0"} w-4 h-4 border-${pos.includes("t") ? "t" : "b"}-2 border-${pos.includes("l") ? "l" : "r"}-2 border-[var(--gold-500)] rounded-${pos}-3xl`}
              />
            ))}
            <QRCodeCanvas
              value={inviteUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#1a1816"
              level="H"
              includeMargin
            />
          </div>
          <button
            onClick={onDownload}
            className="group relative w-full mt-6 overflow-hidden"
          >
            <span
              className="relative z-10 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl
                         font-medium text-white transition-all duration-300 group-hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, var(--terracotta-400), var(--terracotta-500))",
                boxShadow: "0 6px 20px rgba(217, 112, 72, 0.3)",
              }}
            >
              <span className="text-xl">⬇️</span>
              <span>QRコードをダウンロード</span>
            </span>
            <span
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                         transition-opacity duration-500 blur-xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--terracotta-400), var(--terracotta-500))",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
