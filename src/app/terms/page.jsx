import Link from "next/link";

export const metadata = {
  title: "利用規約 | FamDish",
  description: "FamDishの利用規約です。",
};

export default function TermsPage() {
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
          利用規約
        </h1>
        <p className="text-sm text-muted mb-10">最終更新日: 2026年3月1日</p>

        <div className="space-y-10 text-[var(--foreground)] leading-relaxed">
          {/* 第1条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第1条（適用）
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              本利用規約（以下「本規約」といいます）は、FamDish運営（以下「当方」といいます）が提供するWebアプリケーション「FamDish」（以下「本サービス」といいます）の利用条件を定めるものです。ユーザーの皆さまには、本規約に同意いただいたうえで、本サービスをご利用いただきます。
            </p>
          </section>

          {/* 第2条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第2条（定義）
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--warm-gray-600)]">
              <li>
                「本サービス」とは、当方が提供するAI献立提案サービス「FamDish」を指します。
              </li>
              <li>
                「ユーザー」とは、本サービスに登録し利用する個人を指します。
              </li>
              <li>
                「コンテンツ」とは、本サービス上でユーザーが入力・投稿する情報を指します。
              </li>
            </ul>
          </section>

          {/* 第3条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第3条（アカウント登録）
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--warm-gray-600)]">
              <li>本サービスの利用にはアカウント登録が必要です。</li>
              <li>
                登録にあたり、正確かつ最新の情報を提供していただく必要があります。
              </li>
              <li>
                アカウントの管理責任はユーザーにあり、第三者への貸与・譲渡はできません。
              </li>
              <li>
                当方は、登録内容に虚偽がある場合、アカウントを停止・削除できるものとします。
              </li>
            </ol>
          </section>

          {/* 第4条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第4条（禁止事項）
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)] mb-2">
              ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--warm-gray-600)]">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当方のサーバーまたはネットワーク機能を妨害する行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに関する個人情報等を収集・蓄積する行為</li>
              <li>不正アクセスまたはこれを試みる行為</li>
              <li>他のユーザーになりすます行為</li>
              <li>当方のサービスに関連して反社会的勢力に利益を供与する行為</li>
              <li>その他、当方が不適切と判断する行為</li>
            </ul>
          </section>

          {/* 第5条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第5条（本サービスの提供の停止等）
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              当方は、以下のいずれかの事由があると判断した場合、ユーザーに事前通知することなく本サービスの全部または一部の提供を停止・中断できるものとします。
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--warm-gray-600)] mt-2">
              <li>本サービスにかかるシステムの保守点検または更新を行う場合</li>
              <li>
                地震・落雷・火災・停電その他の不可抗力により提供が困難になった場合
              </li>
              <li>その他、当方が停止・中断を必要と判断した場合</li>
            </ul>
          </section>

          {/* 第6条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第6条（知的財産権）
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              本サービスに関する知的財産権はすべて当方に帰属します。ユーザーが本サービス上で投稿したコンテンツについて、当方はサービスの改善・運営目的のために利用できるものとします。
            </p>
          </section>

          {/* 第7条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第7条（免責事項）
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--warm-gray-600)]">
              <li>
                当方は、本サービスが提供するAIによる献立提案の正確性・完全性・有用性を保証するものではありません。
              </li>
              <li>
                本サービスで提案されるレシピに基づく食事によるアレルギー反応や健康被害について、当方は一切の責任を負いません。
              </li>
              <li>
                ユーザー同士のトラブルについて、当方は一切の責任を負いません。
              </li>
            </ul>
          </section>

          {/* 第8条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第8条（退会）
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              ユーザーは、当方所定の手続により、いつでも退会しアカウントを削除することができます。退会後のデータ復旧には対応いたしかねます。
            </p>
          </section>

          {/* 第9条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第9条（規約の変更）
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              当方は、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができるものとします。変更後の利用規約は、本サービス上に掲載した時点から効力を生じるものとします。
            </p>
          </section>

          {/* 第10条 */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              第10条（準拠法・裁判管轄）
            </h2>
            <p className="text-sm text-[var(--warm-gray-600)]">
              本規約の解釈にあたっては日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当方所在地を管轄する裁判所を専属的合意管轄裁判所とします。
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
