/** 機能紹介カード */
export function FeatureCard({ icon, title, desc, bg, border }) {
  return (
    <div className={`text-center p-4 sm:p-5 rounded-xl ${bg} border ${border}`}>
      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-xl bg-white flex items-center justify-center shadow-sm">
        <span className="text-2xl sm:text-3xl">{icon}</span>
      </div>
      <h4 className="text-sm sm:text-base font-semibold text-[var(--foreground)] mb-1">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-muted">{desc}</p>
    </div>
  );
}
