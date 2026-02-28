"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { apiClient } from "@/shared/lib/api";
import { AuthHeader } from "@/shared/components/auth_header";
import Link from "next/link";
import { INFO_ITEMS, CARD_CLASS } from "@/features/member/constants";
import { formatExpiresAt } from "@/features/member/lib/helpers";
import { AmbientBackground } from "@/features/member/components/AmbientBackground";
import { InfoItem } from "@/features/member/components/InfoItem";
import { FamilyInfoBadge } from "@/features/member/components/FamilyInfoBadge";
import { ErrorBanner } from "@/features/member/components/ErrorBanner";
import { LinkSection } from "@/features/member/components/LinkSection";
import { QRCodeSection } from "@/features/member/components/QRCodeSection";

// ── メインコンポーネント ──

export default function CreateInvitePage() {
  const router = useRouter();
  const qrCodeRef = useRef(null);

  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // ── 認証 & メンバー情報取得 ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      try {
        const res = await apiClient.get("/api/members/me");
        if (!res?.data?.member) {
          router.replace("/profile/step1");
          return;
        }
        setMemberInfo(res.data);
      } catch {
        setError("メンバー情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── 招待リンク生成 ──
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError("");
    setCopied(false);
    try {
      const res = await apiClient.post("/api/invitations");
      setInvitation(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "招待リンクの生成に失敗しました");
    } finally {
      setGenerating(false);
    }
  }, []);

  // ── クリップボードコピー ──
  const handleCopy = useCallback(async () => {
    if (!invitation?.invite_url) return;
    try {
      await navigator.clipboard.writeText(invitation.invite_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert("クリップボードへのコピーに失敗しました");
    }
  }, [invitation]);

  // ── QRコードダウンロード ──
  const handleDownloadQR = useCallback(() => {
    if (!qrCodeRef.current) return;
    try {
      const canvas = qrCodeRef.current.querySelector("canvas");
      if (!canvas) {
        alert("QRコードの生成に失敗しました");
        return;
      }
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "family_invitation_qr.png";
      a.click();
    } catch (err) {
      console.error("QRコードダウンロードエラー:", err);
      alert("QRコードのダウンロードに失敗しました");
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <AuthHeader />
        <div className="luxury-page flex items-center justify-center min-h-screen">
          <div className="luxury-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <AuthHeader />
      <AmbientBackground />

      <div className="relative luxury-page pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* ─── ヒーローセクション ─── */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full backdrop-blur-md bg-white/40 border border-[var(--gold-400)]/30">
              <span className="text-2xl">💌</span>
              <span
                className="text-sm font-medium text-[var(--gold-600)] tracking-wide"
                style={{ fontFamily: "var(--font-body)" }}
              >
                FAMILY INVITATION
              </span>
            </div>
            <h1
              className="text-5xl md:text-7xl font-light text-[var(--foreground)] mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              家族への招待
            </h1>
            <p
              className="max-w-2xl mx-auto text-xl text-[var(--warm-gray-500)] leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              大切な家族をFamDishに招待しましょう。
              <br />
              家族への招待リンクを生成します。
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[var(--gold-400)]" />
              <div className="w-2 h-2 rounded-full bg-[var(--gold-400)]" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[var(--gold-400)]" />
            </div>
            <div className="mt-8">
              <Link
                href="/members/index"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--gold-50)] border border-[var(--gold-200)] text-[var(--gold-700)] hover:bg-[var(--gold-100)] transition-colors font-medium text-sm"
              >
                <span>👥</span>
                <span>メンバー一覧を見る</span>
              </Link>
            </div>
          </div>

          <FamilyInfoBadge familyName={memberInfo?.family_name} />
          <ErrorBanner message={error} />

          {/* ─── メインコンテンツ ─── */}
          {!invitation ? (
            <div className="max-w-2xl mx-auto animate-fade-in-up stagger-2">
              <div
                className={`${CARD_CLASS} rounded-[2.5rem] shadow-2xl`}
                style={{
                  boxShadow:
                    "0 20px 60px rgba(212, 175, 55, 0.15), 0 8px 24px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div
                  className="h-1.5"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--terracotta-400), var(--gold-400), var(--sage-400))",
                  }}
                />
                <div className="p-12">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="group relative w-full overflow-hidden"
                  >
                    <span
                      className="relative z-10 flex items-center justify-center gap-3 px-8 py-6 rounded-3xl
                                 font-medium text-white text-lg transition-all duration-500
                                 group-hover:scale-105 group-disabled:scale-100"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 50%, var(--sage-700) 100%)",
                        boxShadow:
                          "0 8px 24px rgba(90, 122, 90, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      {generating ? (
                        <>
                          <div className="luxury-spinner !w-6 !h-6 !border-2" />
                          <span>生成中...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">✨</span>
                          <span>招待リンクを生成</span>
                        </>
                      )}
                    </span>
                    <span
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--sage-400), var(--sage-600))",
                      }}
                    />
                  </button>

                  <div className="mt-10 pt-10 border-t border-[var(--border)]">
                    <h3
                      className="text-xl font-medium text-[var(--foreground)] mb-4"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      招待リンクについて
                    </h3>
                    <ul className="space-y-3">
                      {INFO_ITEMS.map(({ icon, text }) => (
                        <InfoItem key={text} icon={icon} text={text} />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
              {/* 成功メッセージ */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-[var(--sage-50)] to-white/80 border-2 border-[var(--sage-300)] rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">✓</span>
                  <div className="flex-1">
                    <div
                      className="text-xl font-medium text-[var(--sage-700)] mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      招待リンクを生成しました
                    </div>
                    <p className="text-[var(--sage-600)]">
                      有効期限: {formatExpiresAt(invitation.expires_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* リンク & QRコード */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LinkSection
                  inviteUrl={invitation.invite_url}
                  copied={copied}
                  onCopy={handleCopy}
                />
                <QRCodeSection
                  inviteUrl={invitation.invite_url}
                  qrCodeRef={qrCodeRef}
                  onDownload={handleDownloadQR}
                />
              </div>

              {/* セキュリティ通知 */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-[var(--cream-100)] to-white/70 border border-[var(--gold-400)]/20 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div
                      className="font-medium text-[var(--warm-gray-700)] mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      セキュリティについて
                    </div>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      このリンク・QRコードを知っている人は誰でも家族に参加できます。
                      信頼できる人にのみ共有してください。
                    </p>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setInvitation(null)}
                  className="luxury-btn luxury-btn-primary flex-1 text-lg"
                >
                  <span className="text-xl mr-2">✨</span>新しいリンクを生成
                </button>
                <button
                  onClick={() => router.push("/members/index")}
                  className="luxury-btn luxury-btn-outline flex-1 text-lg"
                >
                  メンバー一覧へ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
