"use client";

import Link from "next/link";
import HamburgerButton from "./HamburgerButton";
import MobileMenuItems from "./MobileMenuItems";
import { useState, useEffect } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Ambient glow effect */}
      <div className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-40">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 175, 55, 0.15), transparent)",
          }}
        ></div>
      </div>

      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
          scrolled
            ? "backdrop-blur-xl bg-white/70 shadow-2xl border-b border-[var(--gold-400)]/20"
            : "backdrop-blur-md bg-white/60 border-b border-white/20"
        }`}
        style={{
          boxShadow: scrolled
            ? "0 8px 32px rgba(212, 175, 55, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)"
            : "0 4px 16px rgba(0, 0, 0, 0.02)",
        }}
      >
        {/* Subtle gold accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-60"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--gold-400) 50%, transparent)",
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-24">
            {/* Logo with luxury treatment */}
            <Link
              href="/"
              className="group relative"
            >
              <span
                className="text-4xl font-light tracking-tight text-[var(--foreground)]
                         transition-all duration-500 group-hover:text-[var(--gold-500)]
                         relative inline-block"
                style={{ fontFamily: "var(--font-display)" }}
              >
                FamDish

                {/* Decorative underline */}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[var(--gold-400)] to-[var(--terracotta-400)]
                           transition-all duration-500 group-hover:w-full"
                ></span>

                {/* Shimmer effect on hover */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background:
                      "linear-gradient(120deg, transparent, rgba(212, 175, 55, 0.1), transparent)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s infinite",
                  }}
                ></span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink href="/">ホーム</NavLink>
              <NavLink href="/sign-in">新規登録</NavLink>

              <Link
                href="/login"
                className="ml-4 relative group overflow-hidden"
              >
                <span
                  className="px-6 py-3 rounded-full font-medium text-white
                           relative z-10 flex items-center gap-2 transition-transform duration-300
                           group-hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)",
                    boxShadow:
                      "0 4px 16px rgba(90, 122, 90, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  ログイン
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>

                {/* Glow effect */}
                <span
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--sage-400), var(--sage-600))",
                  }}
                ></span>
              </Link>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <HamburgerButton onToggle={(open) => setMenuOpen(open)} />
              {menuOpen && (
                <nav
                  className="absolute top-full right-0 left-0 z-20 backdrop-blur-xl bg-white/90
                           border-b border-[var(--gold-400)]/20 shadow-2xl animate-fade-in"
                  style={{
                    boxShadow:
                      "0 8px 32px rgba(212, 175, 55, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <ul className="flex flex-col p-6">
                    <MobileMenuItems onClick={() => setMenuOpen(false)} />
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-40"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--terracotta-300) 30%, var(--gold-400) 50%, var(--sage-300) 70%, transparent)",
          }}
        ></div>
      </header>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  );
}

// Luxury Nav Link Component
function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="group relative px-4 py-2.5 rounded-full transition-all duration-300
                 hover:bg-[var(--cream-100)]"
    >
      <span
        className="relative z-10 font-medium text-[var(--foreground)]
                   transition-colors duration-300 group-hover:text-[var(--primary)]"
      >
        {children}
      </span>

      {/* Hover ripple effect */}
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                   transition-opacity duration-500 blur-md"
        style={{
          background:
            "radial-gradient(circle at center, var(--sage-200), transparent 70%)",
        }}
      ></span>

      {/* Subtle border on hover */}
      <span
        className="absolute inset-0 rounded-full border border-[var(--gold-400)]/0
                   transition-all duration-300 group-hover:border-[var(--gold-400)]/30"
      ></span>
    </Link>
  );
}
