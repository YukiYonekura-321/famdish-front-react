/** 装飾背景 */
export function AmbientBackground() {
  return (
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
      />
      <div
        className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
        style={{
          background:
            "radial-gradient(circle, var(--terracotta-300), transparent 70%)",
          animationDuration: "8s",
        }}
      />
      <div
        className="absolute bottom-32 right-20 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse"
        style={{
          background:
            "radial-gradient(circle, var(--sage-300), transparent 70%)",
          animationDuration: "10s",
          animationDelay: "2s",
        }}
      />
    </div>
  );
}
