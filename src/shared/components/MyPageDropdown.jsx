"use client";

import { useState, useCallback } from "react";
import ChevronIcon from "@/shared/components/ChevronIcon";
import DropdownLink from "@/shared/components/DropdownLink";
import { MYPAGE_LINKS } from "@/shared/components/nav-items";

export default function MyPageDropdown({ onLogout }) {
  const [open, setOpen] = useState(false);

  const handleLogout = useCallback(() => {
    const confirmed = confirm("ログアウトしますか？");
    if (!confirmed) return;
    setOpen(false);
    onLogout();
  }, [onLogout]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="group relative px-5 py-2.5 rounded-full transition-all duration-300
                   hover:bg-gradient-to-br from-[var(--cream-100)] to-[var(--cream-200)] ml-2"
        onClick={() => setOpen((prev) => !prev)}
        title="マイページ"
      >
        <span
          className="relative z-10 font-medium text-[var(--foreground)]
                     transition-colors duration-300 group-hover:text-[var(--primary)]
                     flex items-center gap-2"
        >
          <span>⚙️</span>
          <span className="hidden lg:inline">マイページ</span>
          <ChevronIcon open={open} />
        </span>

        {/* Hover glow effect */}
        <span
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                     transition-opacity duration-500 blur-lg"
          style={{
            background:
              "radial-gradient(circle, var(--sage-200), transparent 70%)",
          }}
        />

        {/* Gold border on hover */}
        <span
          className="absolute inset-0 rounded-full border border-[var(--gold-400)]/0
                     transition-all duration-300 group-hover:border-[var(--gold-400)]/40"
        />
      </button>

      {/* Premium Dropdown Menu */}
      <div
        className="absolute right-0 top-full mt-0 w-80 backdrop-blur-2xl
                   bg-white/90 rounded-3xl shadow-2xl border border-[var(--gold-400)]/20
                   overflow-hidden origin-top-right
                   pointer-events-auto transition-all duration-500 ease-out
                   invisible group-hover:visible opacity-0 group-hover:opacity-100
                   scale-y-95 group-hover:scale-y-100"
        style={{
          boxShadow:
            "0 20px 60px rgba(212, 175, 55, 0.15), 0 8px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Gold accent top border */}
        <div
          className="h-1"
          style={{
            background:
              "linear-gradient(90deg, var(--terracotta-400), var(--gold-400), var(--sage-400))",
          }}
        />

        <div className="p-3">
          {MYPAGE_LINKS.map((item) => (
            <DropdownLink key={item.href} href={item.href}>
              <span className="text-lg mr-2">{item.icon}</span>
              {item.label}
            </DropdownLink>
          ))}

          <div className="my-2 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

          <button
            onClick={handleLogout}
            className="w-full text-left group relative px-4 py-3 rounded-2xl
                       transition-all duration-300 hover:bg-[var(--cream-100)]
                       flex items-center"
          >
            <span className="text-lg mr-2">🚪</span>
            <span className="font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
              ログアウト
            </span>
          </button>

          <DropdownLink href="/mypage/withdraw" danger>
            <span className="text-lg mr-2">⚠️</span>
            退会
          </DropdownLink>
        </div>
      </div>
    </div>
  );
}
