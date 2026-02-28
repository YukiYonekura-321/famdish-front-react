"use client";

import { PROVIDERS } from "@/features/auth/lib/providers";
import { useProviderLink } from "@/features/auth/hooks/useProviderLink";

export function ProviderLinkTable({ user }) {
  const {
    linkedProviders,
    canUnlink,
    error,
    processing,
    linkProvider,
    unlinkProvider,
  } = useProviderLink(user);

  return (
    <div className="space-y-4">
      {/* エラーメッセージ */}
      {error && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-[var(--terracotta-50)] to-white/80 border border-[var(--terracotta-300)] rounded-2xl p-4 animate-scale-in">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-[var(--terracotta-600)]">{error}</p>
          </div>
        </div>
      )}

      {/* プロバイダ一覧 */}
      <div className="divide-y divide-[var(--border)]">
        {PROVIDERS.map(({ id, name, provider }) => {
          const isLinked = linkedProviders.includes(id);
          return (
            <div
              key={id}
              className="flex items-center justify-between py-4 px-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-medium text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {name}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    isLinked
                      ? "bg-[var(--sage-100)] text-[var(--sage-600)]"
                      : "bg-[var(--warm-gray-100)] text-[var(--warm-gray-500)]"
                  }`}
                >
                  {isLinked ? "連携済み" : "未連携"}
                </span>
              </div>

              <div>
                {isLinked ? (
                  canUnlink && (
                    <button
                      disabled={processing}
                      onClick={() => unlinkProvider(id)}
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-[var(--warm-gray-300)]
                               text-[var(--warm-gray-600)] hover:bg-[var(--warm-gray-100)]
                               transition-colors duration-200 disabled:opacity-50"
                    >
                      解除
                    </button>
                  )
                ) : (
                  <button
                    disabled={processing}
                    onClick={() => linkProvider(provider)}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-[var(--sage-500)] text-white
                             hover:bg-[var(--sage-600)] transition-colors duration-200 disabled:opacity-50"
                  >
                    連携する
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
