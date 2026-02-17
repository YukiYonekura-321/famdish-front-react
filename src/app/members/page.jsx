"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";
import { AuthHeader } from "@/components/auth_header";
import { QRCodeCanvas } from "qrcode.react";

export default function CreateInvitePage() {
  const router = useRouter();
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const qrCodeRef = useRef(null);

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
      } catch (err) {
        console.error("メンバー情報取得エラー:", err);
        setError("メンバー情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setCopied(false);

    try {
      const res = await apiClient.post("/api/invitations");
      setInvitation(res.data);
    } catch (err) {
      console.error("招待生成エラー:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("招待リンクの生成に失敗しました");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!invitation?.invite_url) return;

    try {
      await navigator.clipboard.writeText(invitation.invite_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("コピーエラー:", err);
      alert("クリップボードへのコピーに失敗しました");
    }
  };

  const handleDownloadQR = () => {
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
  };

  const formatExpiresAt = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AuthHeader />
        <div className="luxury-page flex items-center justify-center min-h-screen">
          <div className="luxury-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <AuthHeader />

      {/* Ambient background with organic shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient mesh background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 30% 20%, rgba(217, 112, 72, 0.08), transparent),
              radial-gradient(ellipse 70% 50% at 70% 80%, rgba(90, 122, 90, 0.08), transparent),
              radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05), transparent 70%)
            `,
          }}
        ></div>

        {/* Floating organic shapes */}
        <div
          className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--terracotta-300), transparent 70%)",
            animationDuration: "8s",
          }}
        ></div>
        <div
          className="absolute bottom-32 right-20 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--sage-300), transparent 70%)",
            animationDuration: "10s",
            animationDelay: "2s",
          }}
        ></div>
      </div>

      <div className="relative luxury-page pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
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
              className="text-xl text-[var(--warm-gray-500)] max-w-2xl mx-auto leading-relaxed text-center"
              style={{ fontFamily: "var(--font-body)" }}
            >
              大切な家族をFamDishに招待しましょう。
              <br />
              あなただけの特別な招待リンクを生成します。
            </p>

            {/* Decorative line */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[var(--gold-400)]"></div>
              <div className="w-2 h-2 rounded-full bg-[var(--gold-400)]"></div>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[var(--gold-400)]"></div>
            </div>
          </div>

          {/* Family Info Badge */}
          {memberInfo?.family_name && (
            <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up stagger-1">
              <div
                className="backdrop-blur-xl bg-gradient-to-br from-white/70 to-white/50
                         border border-[var(--gold-400)]/20 rounded-3xl p-6 shadow-xl"
                style={{
                  boxShadow:
                    "0 12px 40px rgba(212, 175, 55, 0.12), 0 4px 16px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--sage-400)] to-[var(--sage-600)]
                             flex items-center justify-center text-2xl shadow-lg"
                  >
                    🏠
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-sm text-[var(--muted)] mb-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Your Family
                    </div>
                    <div
                      className="text-2xl font-medium text-[var(--foreground)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {memberInfo.family_name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="max-w-2xl mx-auto mb-8 backdrop-blur-xl bg-gradient-to-br from-[var(--terracotta-50)] to-white/80
                       border-2 border-[var(--terracotta-300)] rounded-3xl p-6 animate-scale-in"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div
                    className="font-medium text-[var(--terracotta-600)] mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    エラーが発生しました
                  </div>
                  <p className="text-sm text-[var(--terracotta-600)]">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Card */}
          {!invitation ? (
            <div className="max-w-2xl mx-auto animate-fade-in-up stagger-2">
              <div
                className="backdrop-blur-2xl bg-gradient-to-br from-white/80 to-white/60
                         border border-[var(--gold-400)]/30 rounded-[2.5rem] overflow-hidden shadow-2xl"
                style={{
                  boxShadow:
                    "0 20px 60px rgba(212, 175, 55, 0.15), 0 8px 24px rgba(0, 0, 0, 0.08)",
                }}
              >
                {/* Gold accent top border */}
                <div
                  className="h-1.5"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--terracotta-400), var(--gold-400), var(--sage-400))",
                  }}
                ></div>

                <div className="p-12">
                  {/* Generate Button */}
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
                          <div className="luxury-spinner !w-6 !h-6 !border-2"></div>
                          <span>生成中...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">✨</span>
                          <span>招待リンクを生成</span>
                        </>
                      )}
                    </span>

                    {/* Hover glow */}
                    <span
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100
                               transition-opacity duration-700 blur-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--sage-400), var(--sage-600))",
                      }}
                    ></span>
                  </button>

                  {/* Info Section */}
                  <div className="mt-10 pt-10 border-t border-[var(--border)]">
                    <h3
                      className="text-xl font-medium text-[var(--foreground)] mb-4"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      招待リンクについて
                    </h3>
                    <ul className="space-y-3">
                      <InfoItem icon="⏰" text="リンクは7日間有効です" />
                      <InfoItem
                        icon="🔗"
                        text="リンクを受け取った人は、家族に参加できます"
                      />
                      <InfoItem
                        icon="♾️"
                        text="必要に応じて何度でも生成できます"
                      />
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
              {/* Success Message */}
              <div
                className="backdrop-blur-xl bg-gradient-to-br from-[var(--sage-50)] to-white/80
                         border-2 border-[var(--sage-300)] rounded-3xl p-6"
              >
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

              {/* Invitation Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Link Section */}
                <div
                  className="backdrop-blur-2xl bg-gradient-to-br from-white/80 to-white/60
                           border border-[var(--gold-400)]/30 rounded-3xl overflow-hidden shadow-xl"
                  style={{
                    boxShadow:
                      "0 12px 40px rgba(212, 175, 55, 0.12), 0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    className="h-1"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--gold-400), var(--terracotta-400))",
                    }}
                  ></div>

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">📋</span>
                      <h3
                        className="text-2xl font-medium text-[var(--foreground)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        招待リンク
                      </h3>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={invitation.invite_url}
                        readOnly
                        className="w-full px-5 py-4 bg-[var(--cream-100)] border-2 border-[var(--border)]
                                 rounded-2xl text-sm font-mono text-[var(--foreground)]
                                 focus:outline-none focus:border-[var(--gold-400)] transition-colors"
                        onClick={(e) => e.target.select()}
                      />
                    </div>

                    <button
                      onClick={handleCopy}
                      className="group relative w-full mt-6 overflow-hidden"
                    >
                      <span
                        className="relative z-10 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl
                                 font-medium transition-all duration-300 group-hover:scale-105"
                        style={{
                          background: copied
                            ? "linear-gradient(135deg, var(--sage-500), var(--sage-600))"
                            : "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                          color: "white",
                          boxShadow: copied
                            ? "0 6px 20px rgba(90, 122, 90, 0.3)"
                            : "0 6px 20px rgba(212, 175, 55, 0.3)",
                        }}
                      >
                        {copied ? (
                          <>
                            <span className="text-xl">✓</span>
                            <span>コピーしました</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">📋</span>
                            <span>リンクをコピー</span>
                          </>
                        )}
                      </span>

                      {/* Ripple effect */}
                      <span
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                                 transition-opacity duration-500 blur-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--gold-400), var(--gold-600))",
                        }}
                      ></span>
                    </button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div
                  className="backdrop-blur-2xl bg-gradient-to-br from-white/80 to-white/60
                           border border-[var(--gold-400)]/30 rounded-3xl overflow-hidden shadow-xl"
                  style={{
                    boxShadow:
                      "0 12px 40px rgba(212, 175, 55, 0.12), 0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    className="h-1"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--sage-400), var(--gold-400))",
                    }}
                  ></div>

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">📱</span>
                      <h3
                        className="text-2xl font-medium text-[var(--foreground)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        QRコード
                      </h3>
                    </div>

                    <div className="flex flex-col items-center">
                      {/* QR Code with premium frame */}
                      <div
                        ref={qrCodeRef}
                        className="relative p-6 bg-white rounded-3xl border-2 border-[var(--gold-400)]/20 shadow-lg"
                        style={{
                          boxShadow:
                            "0 8px 24px rgba(212, 175, 55, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        {/* Decorative corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--gold-500)] rounded-tl-3xl"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--gold-500)] rounded-tr-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--gold-500)] rounded-bl-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--gold-500)] rounded-br-3xl"></div>

                        <QRCodeCanvas
                          value={invitation.invite_url}
                          size={220}
                          bgColor="#ffffff"
                          fgColor="#1a1816"
                          level="H"
                          includeMargin={true}
                        />
                      </div>

                      <button
                        onClick={handleDownloadQR}
                        className="group relative w-full mt-6 overflow-hidden"
                      >
                        <span
                          className="relative z-10 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl
                                   font-medium text-white transition-all duration-300 group-hover:scale-105"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--terracotta-400), var(--terracotta-500))",
                            boxShadow: "0 6px 20px rgba(217, 112, 72, 0.3)",
                          }}
                        >
                          <span className="text-xl">⬇️</span>
                          <span>QRコードをダウンロード</span>
                        </span>

                        <span
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                                   transition-opacity duration-500 blur-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--terracotta-400), var(--terracotta-500))",
                          }}
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div
                className="backdrop-blur-xl bg-gradient-to-br from-[var(--cream-100)] to-white/70
                         border border-[var(--gold-400)]/20 rounded-3xl p-6"
              >
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setInvitation(null)}
                  className="luxury-btn luxury-btn-primary flex-1 text-lg"
                >
                  <span className="text-xl mr-2">✨</span>
                  新しいリンクを生成
                </button>
                <button
                  onClick={() => router.push("/menus")}
                  className="luxury-btn luxury-btn-outline flex-1 text-lg"
                >
                  メニュー一覧へ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({ icon, text }) {
  return (
    <li className="flex items-start gap-3 group">
      <span className="text-xl transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <span className="text-[var(--foreground)] flex-1 leading-relaxed">
        {text}
      </span>
    </li>
  );
}
