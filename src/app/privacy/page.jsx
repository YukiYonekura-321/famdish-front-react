import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー | FamDish",
  description: "FamDishのプライバシーポリシーです。",
};

export default function PrivacyPage() {
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1
          className="text-3xl sm:text-4xl font-semibold text-[var(--foreground)] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          プライバシーポリシー
        </h1>
        <p className="text-sm text-muted mb-10">最終更新日: 2026年3月1日</p>

        <div className="space-y-10 text-[var(--foreground)] leading-relaxed">
          {/* はじめに */}
          <section>
            <p className="text-sm text-[var(--warm-gray-600)]">
              FamDish運営（以下「当方」といいます）は、Webアプリケーション「FamDish」（以下「本サービス」といいます）におけるユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
            </p>
          </section>

          {/* 第1条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              1. 収集する情報
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)] mb-2">
              当方は、本サービスの提供にあたり、以下の情報を収集する場合があります。
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--warm-gray-600)]">
              <li>メールアドレス</li>
              <li>
                ソーシャルアカウント情報（Google、X(Twitter)、GitHub等のログイン連携時）
              </li>
              <li>
                プロフィール情報（ニックネーム、食の好み、アレルギー情報等）
              </li>
              <li>家族構成に関する情報</li>
              <li>食材・在庫に関する情報</li>
              <li>
                本サービスの利用履歴（献立提案のリクエスト・フィードバック等）
              </li>
              <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時等）</li>
            </ul>
          </section>

          {/* 第2条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              2. 情報の利用目的
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)] mb-2">
              収集した情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--warm-gray-600)]">
              <li>本サービスの提供・運営・改善</li>
              <li>ユーザーの本人確認および認証</li>
              <li>AIによる献立提案の最適化</li>
              <li>ユーザーサポートへの対応</li>
              <li>利用規約に違反する行為への対応</li>
              <li>サービスに関する重要なお知らせの送信</li>
              <li>統計データの作成（個人を特定できない形式）</li>
            </ul>
          </section>

          {/* 第3条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              3. 第三者への情報提供
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              当方は、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--warm-gray-600)] mt-2">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく開示請求があった場合</li>
              <li>人の生命・身体・財産の保護のために必要がある場合</li>
              <li>
                サービス利用に必要な範囲で業務委託先に提供する場合（適切な管理のもと）
              </li>
            </ul>
          </section>

          {/* 第4条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              4. 外部サービスの利用
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)] mb-2">
              本サービスでは、以下の外部サービスを利用しています。各サービスのプライバシーポリシーもあわせてご確認ください。
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--warm-gray-600)]">
              <li>Firebase Authentication（Google LLC） — ユーザー認証</li>
              <li>OpenAI API — AI献立提案の生成</li>
            </ul>
          </section>

          {/* 第5条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              5. Cookieの使用
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              本サービスでは、ユーザー体験の向上やセッション管理のためにCookieを使用しています。ブラウザの設定によりCookieを無効にすることもできますが、その場合、本サービスの一部機能が利用できなくなる可能性があります。
            </p>
          </section>

          {/* 第6条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              6. データの保管とセキュリティ
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              当方は、収集した個人情報の漏洩・滅失・毀損の防止のために、適切な安全管理措置を講じます。ただし、インターネット上の通信においてセキュリティを完全に保証するものではありません。
            </p>
          </section>

          {/* 第7条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              7. データの開示・訂正・削除
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              ユーザーは、当方に対して自身の個人情報の開示・訂正・削除を請求することができます。退会機能によりアカウントおよび関連データの削除が可能です。ご要望がある場合はお問い合わせページよりご連絡ください。
            </p>
          </section>

          {/* 第8条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              8. 未成年のご利用について
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              未成年の方が本サービスをご利用になる場合は、保護者の同意を得たうえでご利用ください。
            </p>
          </section>

          {/* 第9条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              9. プライバシーポリシーの変更
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              当方は、必要に応じて本ポリシーを変更することがあります。重要な変更がある場合は、本サービス上でお知らせいたします。変更後のポリシーは、本サービスに掲載した時点から効力を生じます。
            </p>
          </section>

          {/* 第10条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              10. お問い合わせ
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              本ポリシーに関するお問い合わせは、
              <Link
                href="/contact"
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] underline"
              >
                お問い合わせページ
              </Link>
              よりお願いいたします。
            </p>
          </section>
        </div>

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
