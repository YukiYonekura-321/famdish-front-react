# FamDish Frontend

> 食卓で家族は繋がる — 献立の悩みを解決するファミリーアプリ

AI が家族の好み・冷蔵庫の食材・予算から最適な献立を提案する Web アプリケーションのフロントエンドです。

---

## Tech Stack

| カテゴリ          | 技術                                                       |
| ----------------- | ---------------------------------------------------------- |
| フレームワーク    | Next.js 16 (App Router / Turbopack)                        |
| 言語              | JavaScript (JSX)                                           |
| スタイリング      | Tailwind CSS 4 + カスタム CSS 変数によるデザインシステム   |
| 認証              | Firebase Authentication (Google / X / GitHub / Email Link) |
| HTTP クライアント | Axios (`apiClient` ラッパー)                               |
| QR コード         | qrcode.react                                               |
| データフェッチ    | SWR (部分的)                                               |
| Lint / Format     | ESLint (next/core-web-vitals) + Prettier                   |
| デプロイ          | Docker (Node 20)                                           |

---

## Architecture

## AWS構成図

![AWS Architecture Diagram](/public/AWS_Architecture%20Diagram.jpeg)

### ディレクトリ構成

```
src/
├── app/                  # Next.js App Router — ページ & API Route
│   ├── layout.js         # ルートレイアウト (Footer 含む)
│   ├── page.jsx          # トップページ
│   ├── login/            # ログイン (Firebase ソーシャル認証)
│   ├── sign-in/          # 新規登録
│   ├── register-email/   # メールリンク認証
│   ├── profile/          # プロフィール登録ウィザード (step1〜step3-2)
│   ├── members/          # 家族招待 & メンバー管理
│   ├── menus/            # AI 献立提案
│   │   ├── familysuggestion/        # わが家の献立
│   │   └── familysuggestion/suggestion/  # みんなの献立
│   ├── request/          # 食べたいものリクエスト
│   ├── stock/            # 冷蔵庫（食材在庫）管理
│   ├── mypage/           # マイページ (招待・SNS連携・メール変更・退会)
│   ├── contact/          # お問い合わせフォーム
│   ├── terms/            # 利用規約
│   ├── privacy/          # プライバシーポリシー
│   └── api/              # Next.js API Route (health check 等)
│
├── features/             # 機能別モジュール (Feature-based)
│   ├── auth/             # 認証ロジック・プロバイダ管理
│   ├── member/           # メンバー表示コンポーネント
│   ├── menu/             # 献立提案ロジック (useSuggestion, useFeedback)
│   ├── profile/          # プロフィール登録コンポーネント
│   ├── recipe/           # レシピ表示 (RecipeCard, RecipeModal, RecipeAccordion)
│   └── stock/            # 在庫表示コンポーネント
│
└── shared/               # アプリ横断の共通コード
    ├── components/       # Header, Footer, AuthHeader, LoadingSpinner 等
    ├── hooks/            # 共通カスタムフック
    └── lib/
        ├── api.js        # Axios インスタンス (認証トークン自動付与)
        └── firebase.js   # Firebase 初期化
```

### 設計思想

| 原則                           | 説明                                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature-based Architecture** | `features/` 配下に機能単位でコンポーネント・フック・ロジックをまとめ、凝集度を高めています。                                                                     |
| **Shared は薄く**              | `shared/` にはアプリ横断でしか使わない UI 部品・ユーティリティのみ配置。機能固有のロジックは `features/` に閉じ込めます。                                        |
| **App Router ファースト**      | Next.js App Router のファイルベースルーティングを活用。ページコンポーネントは `"use client"` で Client Component として動作します。                              |
| **デザインシステム**           | CSS 変数 (`globals.css`) で色・タイポグラフィ・シャドウを一元管理し、Tailwind のユーティリティクラスと組み合わせて "Organic Luxury" なデザインを実現しています。 |

### 状態管理

- **ローカル State 中心** — `useState` / `useCallback` を活用したコンポーネントローカルな状態管理。グローバルステートライブラリは不使用。
- **認証状態** — Firebase `onAuthStateChanged` でリスナーを張り、未認証時は `/login` へリダイレクト。
- **API 通信** — `apiClient` (Axios) がリクエスト時に Firebase ID トークンを自動付与。レスポンスは各ページの `useEffect` / `useCallback` で取得・保持。
- **キャッシュ** — レシピ詳細などは `recipeDetailMap` のようなオブジェクトで手動キャッシュし、同じデータの再取得を抑制。

### 認証フロー

```
ユーザー → Firebase Auth (Google/X/GitHub/Email Link)
        → ID Token 取得
        → apiClient が Authorization: Bearer <token> を自動付与
        → Rails API でトークン検証
```

---

## Features

| 機能               | 画面                                 | 説明                                              |
| ------------------ | ------------------------------------ | ------------------------------------------------- |
| ソーシャルログイン | `/login`                             | Google / X(Twitter) / GitHub によるログイン       |
| メールリンク認証   | `/register-email`                    | パスワード不要のメールリンクログイン              |
| プロフィール登録   | `/profile/step1` 〜                  | ウィザード形式で名前・好き嫌い・アレルギーを登録  |
| 家族招待           | `/members`                           | 招待リンク & QR コードで家族をグループに追加      |
| メンバー管理       | `/members/index`                     | 家族メンバーの一覧・編集・削除                    |
| AI 献立提案        | `/menus`                             | 家族の好み・在庫・予算・時間から AI が献立を提案  |
| わが家の献立       | `/menus/familysuggestion`            | 採用された献立の管理、AI にレシピ（作り方）を質問 |
| みんなの献立       | `/menus/familysuggestion/suggestion` | 他の家族が採用した献立を参考にする                |
| リクエスト         | `/request`                           | 家族が食べたいメニューをリクエスト & いいね       |
| 冷蔵庫管理         | `/stock`                             | 食材の在庫を CRUD 管理。献立提案の入力にもなる    |
| マイページ         | `/mypage/*`                          | SNS 連携管理・メール変更・退会                    |
| お問い合わせ       | `/contact`                           | フォーム送信 (`POST /api/contacts`)               |

---

## Getting Started

### 前提条件

- Node.js 20+
- npm

### インストール

```bash
npm ci
```

### 環境変数

`.env.local` を作成:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

| 変数名                | 説明                                                         |
| --------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | Rails API のベース URL。本番では省略可（同一ドメインの場合） |

### 開発サーバー起動

```bash
npm run dev
```

Turbopack で `http://localhost:3000` に起動します。

### ビルド & 本番起動

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t famdish-front .
docker run -p 3000:3000 famdish-front
```

### Lint

```bash
npm run lint
```

---

## API 通信

すべての API 呼び出しは `src/shared/lib/api.js` の `apiClient` (Axios インスタンス) を経由します。

- **ベース URL**: 環境変数 `NEXT_PUBLIC_API_URL` (未設定時は相対パス)
- **認証**: リクエストインターセプターが Firebase Auth の ID トークンを `Authorization: Bearer` ヘッダーに自動付与
- **主要エンドポイント**: `/api/members`, `/api/menus`, `/api/recipes`, `/api/stocks`, `/api/suggestions`, `/api/goods`, `/api/contacts` 等

---

## Design System

`src/app/globals.css` に定義された CSS 変数ベースのデザインシステムです。

- **カラーパレット**: Terracotta / Sage / Cream / Gold / Warm Gray の 5 系統
- **セマンティックカラー**: `--primary`, `--secondary`, `--accent`, `--surface`, `--border` 等
- **タイポグラフィ**: 見出しは `Cormorant Garamond` (serif)、本文は `Outfit` (sans-serif)
- **コンポーネントクラス**: `.luxury-btn`, `.luxury-card`, `.luxury-input`, `.luxury-select` 等のプリセットクラス

---

## Related Repositories

- **Backend (Rails API)**: 認証検証・データ永続化・AI 献立生成を担当
