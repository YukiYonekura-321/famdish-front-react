"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/shared/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await apiClient.post("/api/contacts", { contact: form });
      setSubmitted(true);
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "送信に失敗しました。しばらくしてから再度お試しください。",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="text-2xl font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            FamDish
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1
          className="text-3xl sm:text-4xl font-semibold text-[var(--foreground)] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          お問い合わせ
        </h1>
        <p className="text-sm text-muted mb-10">
          ご質問・ご要望・不具合のご報告など、お気軽にお問い合わせください。
        </p>

        {submitted ? (
          /* 送信完了メッセージ */
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✅</div>
            <h2
              className="text-2xl font-semibold text-[var(--foreground)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              送信が完了しました
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)] mb-8">
              お問い合わせいただきありがとうございます。
              <br />
              内容を確認のうえ、折り返しご連絡いたします。
            </p>
            <Link
              href="/"
              className="luxury-btn luxury-btn-primary inline-block"
            >
              トップページに戻る
            </Link>
          </div>
        ) : (
          /* フォーム */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* お名前 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="山田 太郎"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white
                           text-[var(--foreground)] text-sm
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]
                           transition-all duration-300"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white
                           text-[var(--foreground)] text-sm
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]
                           transition-all duration-300"
              />
            </div>

            {/* カテゴリ */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                お問い合わせ種別 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white
                           text-[var(--foreground)] text-sm
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]
                           transition-all duration-300 appearance-none"
              >
                <option value="">選択してください</option>
                <option value="general">一般的なご質問</option>
                <option value="bug">不具合のご報告</option>
                <option value="feature">機能のご要望</option>
                <option value="account">アカウントについて</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* メッセージ */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={form.message}
                onChange={handleChange}
                placeholder="お問い合わせ内容を入力してください..."
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white
                           text-[var(--foreground)] text-sm resize-y
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]
                           transition-all duration-300"
              />
            </div>

            {/* 送信ボタン */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={sending}
                className="luxury-btn luxury-btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "送信中..." : "送信する"}
              </button>
            </div>

            <p className="text-xs text-muted">
              お問い合わせいただいた内容は、
              <Link
                href="/privacy"
                className="text-[var(--primary)] hover:underline"
              >
                プライバシーポリシー
              </Link>
              に基づき適切に管理いたします。
            </p>
          </form>
        )}

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <Link
            href="/"
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors duration-300"
          >
            ← トップページに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
