import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <p className="mt-4 text-sm text-muted leading-relaxed">
            食卓で家族は繋がる。
            <br />
            献立の悩みを解決するファミリーアプリ
          </p>
        </div>

        <div className="divider my-8"></div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-6 text-sm">
          <Link
            href="/terms"
            className="text-muted hover:text-[var(--primary)] transition-colors duration-300"
          >
            利用規約
          </Link>
          <Link
            href="/privacy"
            className="text-muted hover:text-[var(--primary)] transition-colors duration-300"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/contact"
            className="text-muted hover:text-[var(--primary)] transition-colors duration-300"
          >
            お問い合わせ
          </Link>
        </div>

        <div className="text-center text-sm text-muted">
          © {new Date().getFullYear()} FamDish. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
