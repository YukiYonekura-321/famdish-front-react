"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { useState, useEffect } from "react";
import { apiClient } from "@/app/lib/api";
import HamburgerButton from "./HamburgerButton";
import MobileAuthMenuItems from "./MobileAuthMenuItems";
import { onAuthStateChanged } from "firebase/auth";

export function AuthHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [myPageOpen, setMyPageOpen] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await apiClient.get("/api/members/me");
          const data = res?.data || {};
          setFamilyName(data.family_name || "");
        } catch (error) {
          console.error("メンバー取得失敗", error);
          setFamilyName("");
        }
      } else {
        setFamilyName("");
      }
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      console.error("❌ Logout failed", err);
    }
  };

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
        ></div>
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
        ></div>

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
                {/* Decorative accent */}
                <span
                  className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-gradient-to-r
                           from-[var(--gold-400)] via-[var(--gold-500)] to-[var(--terracotta-400)]
                           transition-all duration-500 group-hover:w-full shadow-lg shadow-[var(--gold-400)]/30"
                ></span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              <AuthNavLink href="/members" icon="💌">
                家族を招待
              </AuthNavLink>

              <AuthNavLink href="/members/index" icon="👥">
                メンバー一覧
              </AuthNavLink>

              <AuthNavLink href="/request" icon="📝">
                リクエスト
              </AuthNavLink>

              <AuthNavLink href="/menus" icon="📋">
                メニュー提案
              </AuthNavLink>

              <AuthNavLink href="/menus/familysuggestion" icon="🏠">
                わが家の献立
              </AuthNavLink>

              <AuthNavLink href="/stock" icon="🧊">
                冷蔵庫
              </AuthNavLink>

              {/* My Page Dropdown - Ultra Luxury */}
              <div
                className="relative group"
                onMouseEnter={() => setMyPageOpen(true)}
                onMouseLeave={() => setMyPageOpen(false)}
              >
                <button
                  className="group relative px-5 py-2.5 rounded-full transition-all duration-300
                           hover:bg-gradient-to-br from-[var(--cream-100)] to-[var(--cream-200)]
                           ml-2"
                  onClick={() => setMyPageOpen(!myPageOpen)}
                  title="マイページ"
                >
                  <span
                    className="relative z-10 font-medium text-[var(--foreground)]
                             transition-colors duration-300 group-hover:text-[var(--primary)]
                             flex items-center gap-2"
                  >
                    <span>⚙️</span>
                    <span className="hidden lg:inline">マイページ</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 lg:hidden ${
                        myPageOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 hidden lg:block ${
                        myPageOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>

                  {/* Hover glow effect */}
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                             transition-opacity duration-500 blur-lg"
                    style={{
                      background:
                        "radial-gradient(circle, var(--sage-200), transparent 70%)",
                    }}
                  ></span>

                  {/* Gold border on hover */}
                  <span
                    className="absolute inset-0 rounded-full border border-[var(--gold-400)]/0
                             transition-all duration-300 group-hover:border-[var(--gold-400)]/40"
                  ></span>
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
                  ></div>

                  <div className="p-3">
                    <DropdownLink href="/mypage/invite">
                      <span className="text-lg mr-2">👨‍👩‍👧‍👦</span>
                      ログインできない家族を登録
                    </DropdownLink>

                    <DropdownLink href="/mypage/social">
                      <span className="text-lg mr-2">🔗</span>
                      ソーシャルアカウント連携状態
                    </DropdownLink>

                    <DropdownLink href="/mypage/email">
                      <span className="text-lg mr-2">✉️</span>
                      通知先メールアドレス変更
                    </DropdownLink>

                    <div className="my-2 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent"></div>

                    <button
                      onClick={logout}
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
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <HamburgerButton onToggle={(open) => setMenuOpen(open)} />
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
                    <MobileAuthMenuItems onClick={() => setMenuOpen(false)} />
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
        ></div>
      </header>
    </>
  );
}

// Premium Authenticated Nav Link
function AuthNavLink({ href, children, icon }) {
  return (
    <Link
      href={href}
      className="group relative px-4 py-2.5 rounded-full transition-all duration-300
                 hover:bg-gradient-to-br from-[var(--cream-100)] to-[var(--cream-200)]"
      title={children}
    >
      <span
        className="relative z-10 font-medium text-[var(--foreground)]
                   transition-colors duration-300 group-hover:text-[var(--primary)]
                   flex items-center gap-1.5"
      >
        {icon && <span className="text-base">{icon}</span>}
        <span className="hidden lg:inline">{children}</span>
      </span>

      {/* Ripple glow */}
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                   transition-opacity duration-500 blur-md"
        style={{
          background:
            "radial-gradient(circle at center, var(--sage-200), transparent 70%)",
        }}
      ></span>

      {/* Gold accent border */}
      <span
        className="absolute inset-0 rounded-full border border-[var(--gold-400)]/0
                   transition-all duration-300 group-hover:border-[var(--gold-400)]/30"
      ></span>
    </Link>
  );
}

// Premium Dropdown Link
function DropdownLink({ href, children, danger = false }) {
  if (danger) {
    return (
      <Link
        href={href}
        className="group relative block px-4 py-3 rounded-2xl transition-all duration-300
                   hover:bg-[var(--terracotta-50)] flex items-center"
      >
        <span
          className="font-medium transition-colors group-hover:text-[var(--secondary)]"
          style={{ color: "var(--secondary)" }}
        >
          {children}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group relative block px-4 py-3 rounded-2xl transition-all duration-300
                 hover:bg-[var(--cream-100)] flex items-center"
    >
      <span className="font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
        {children}
      </span>

      {/* Hover accent line */}
      <span
        className="absolute left-4 bottom-2 w-0 h-px bg-gradient-to-r from-[var(--gold-400)] to-[var(--terracotta-400)]
                   transition-all duration-300 group-hover:w-12"
      ></span>
    </Link>
  );
}
