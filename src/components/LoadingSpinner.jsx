export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 animate-fade-in">
      <div className="relative w-16 h-16">
        {/* オーガニックなスピナー */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: '4px solid var(--border)',
            borderTopColor: 'var(--sage-500)',
            borderRightColor: 'var(--terracotta-400)',
          }}
        ></div>
        <div
          className="absolute inset-2 rounded-full animate-spin"
          style={{
            border: '3px solid var(--border)',
            borderBottomColor: 'var(--gold-400)',
            borderLeftColor: 'var(--sage-400)',
            animationDirection: 'reverse',
            animationDuration: '1.5s',
          }}
        ></div>
      </div>
      <p
        className="text-center text-muted font-medium animate-pulse"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        提案を生成中です...
      </p>
    </div>
  );
}
