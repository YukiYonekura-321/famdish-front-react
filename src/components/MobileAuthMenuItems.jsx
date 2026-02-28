"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import MobileNavLink from "@/components/MobileNavLink";
import { NAV_ITEMS, MYPAGE_LINKS } from "@/components/nav-items";

export default function MobileAuthMenuItems({ onClick, onLogout }) {
  const [open, setOpen] = useState(false);

  const handleLinkClick = useCallback(
    (fn) => {
      setOpen(false);
      onClick?.();
      fn?.();
    },
    [onClick],
  );

  return (
    <>
      {NAV_ITEMS.map((item) => (
        <MobileNavLink key={item.href} href={item.href} onClick={onClick}>
          {item.icon} {item.label}
        </MobileNavLink>
      ))}

      <li className="relative">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          onBlur={(e) => {
            const related = e.relatedTarget;
            if (!e.currentTarget.parentElement?.contains(related)) {
              setOpen(false);
            }
          }}
          className="text-[var(--foreground)] block py-3 px-4 hover:bg-[var(--surface)]
                     transition-colors duration-300 rounded-lg font-medium w-full text-left"
          aria-expanded={open}
        >
          ⚙️ マイページ
        </button>

        {open && (
          <div
            className="absolute right-0 mt-1 w-56 bg-[var(--surface)] backdrop-blur-md
                       shadow-xl rounded-lg py-2 border border-[var(--border)]"
          >
            {MYPAGE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleLinkClick()}
                className="block px-4 py-2 text-sm text-[var(--foreground)]
                         hover:bg-[var(--surface-hover)] transition-colors duration-300 rounded-md mx-1"
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={() => handleLinkClick(onLogout)}
              className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)]
                       hover:bg-[var(--surface-hover)] transition-colors duration-300 rounded-md mx-1"
            >
              ログアウト
            </button>

            <Link
              href="/mypage/withdraw"
              onClick={() => handleLinkClick()}
              className="block px-4 py-2 text-sm text-red-500
                       hover:bg-[var(--surface-hover)] transition-colors duration-300 rounded-md mx-1"
            >
              退会
            </Link>
          </div>
        )}
      </li>
    </>
  );
}
