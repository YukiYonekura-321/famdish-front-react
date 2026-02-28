"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";
import { NAV_ITEMS } from "@/components/nav-items";
import AuthNavLink from "@/components/AuthNavLink";
import MyPageDropdown from "@/components/MyPageDropdown";
import HamburgerButton from "@/components/HamburgerButton";
import MobileAuthMenuItems from "@/components/MobileAuthMenuItems";

export function AuthHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // ── スクロール検知 ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── 認証 & ファミリー名取得 ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFamilyName("");
        return;
      }
      try {
        const res = await apiClient.get("/api/members/me");
        setFamilyName(res?.data?.family_name || "");
      } catch {
        setFamilyName("");
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch {
      // サイレントフェイル — ログアウト失敗はリトライ可能
    }
  }, [router]);

  return (
    <>
      {/* Ambient gold glow */}
      <div className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-40">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 175, 55, 0.2), transparent)",
          }}
        />
      </div>

      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
          scrolled
            ? "backdrop-blur-2xl bg-white/75 shadow-2xl"
            : "backdrop-blur-xl bg-white/65"
        }`}
        style={{
          boxShadow: scrolled
            ? "0 8px 32px rgba(212, 175, 55, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)"
            : "0 4px 16px rgba(0, 0, 0, 0.02)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
        }}
      >
        {/* Premium gold accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--gold-400) 50%, transparent)",
            opacity: 0.7,
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Logo with family name */}
            <div className="group relative">
              <span
                className="text-2xl font-light tracking-tight text-[var(--foreground)]
                         transition-all duration-500 group-hover:text-[var(--gold-500)]
                         relative inline-block"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {familyName || "FamDish"}
                <span
                  className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-gradient-to-r
                           from-[var(--gold-400)] via-[var(--gold-500)] to-[var(--terracotta-400)]
                           transition-all duration-500 group-hover:w-full shadow-lg shadow-[var(--gold-400)]/30"
                />
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {NAV_ITEMS.map((item) => (
                <AuthNavLink key={item.href} href={item.href} icon={item.icon}>
                  {item.label}
                </AuthNavLink>
              ))}
              <MyPageDropdown onLogout={handleLogout} />
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <HamburgerButton onToggle={setMenuOpen} />
              {menuOpen && (
                <nav
                  className="absolute top-full right-0 left-0 z-20 backdrop-blur-2xl bg-white/90
                           border-b border-[var(--gold-400)]/20 shadow-2xl animate-fade-in"
                  style={{
                    boxShadow:
                      "0 8px 32px rgba(212, 175, 55, 0.12), 0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <ul className="flex flex-col p-6">
                    <MobileAuthMenuItems
                      onClick={() => setMenuOpen(false)}
                      onLogout={handleLogout}
                    />
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--terracotta-300) 25%, var(--gold-400) 50%, var(--sage-300) 75%, transparent)",
            opacity: 0.5,
          }}
        />
      </header>
    </>
  );
}
