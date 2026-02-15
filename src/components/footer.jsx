import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link
              className="text-3xl font-medium text-[var(--foreground)] tracking-tight hover:text-[var(--primary)] transition-colors duration-300"
              href="/"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              FamDish
            </Link>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              食卓で家族は繋がる。<br />
              献立の悩みを解決するファミリーアプリ
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              サービス
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted hover:text-[var(--primary)] transition-colors">
                  FamDishとは
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="text-muted hover:text-[var(--primary)] transition-colors">
                  新規登録
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted hover:text-[var(--primary)] transition-colors">
                  ログイン
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-[var(--foreground)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              お問い合わせ
            </h3>
            <p className="text-sm text-muted">
              ご質問やご要望がございましたら、<br />
              お気軽にお問い合わせください。
            </p>
          </div>
        </div>

        <div className="divider my-8"></div>

        <div className="text-center text-sm text-muted">
          © {new Date().getFullYear()} FamDish. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
