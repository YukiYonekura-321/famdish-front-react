# FamDish Frontend

AI が家族の好み・冷蔵庫の食材・予算から最適な献立を提案する Web アプリケーションのフロントエンドです。

---

## 1. 技術スタック（Tech Stack）

| カテゴリ          | 技術                                                       |
| ----------------- | ---------------------------------------------------------- |
| フレームワーク    | Next.js 16 (App Router)                                    |
| 言語              | JavaScript (JSX)                                           |
| スタイリング      | Tailwind CSS 4 + カスタム CSS 変数によるデザインシステム   |
| 認証              | Firebase Authentication (Google / X / GitHub / Email Link) |
| HTTP クライアント | Axios (`apiClient` ラッパー)                               |
| QR コード         | qrcode.react                                               |
| Lint / Format     | ESLint (next/core-web-vitals) + Prettier                   |
| 単体テスト        | Jest                                                       |
| E2E テスト        | Playwright (chromium, mobile-safari, smoke)                |
| CI/CD             | GitHub Actions                                             |
| コンテナ          | Docker (Node 20)                                           |

## 2. ディレクトリ構成

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

## 3. 設計思想

| 原則                           | 説明                                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature-based Architecture** | `features/` 配下に機能単位でコンポーネント・フック・ロジックをまとめ、凝集度を高めています。                                                                     |
| **Shared は薄く**              | `shared/` にはアプリ横断でしか使わない UI 部品・ユーティリティのみ配置。機能固有のロジックは `features/` に閉じ込めます。                                        |
| **App Router ファースト**      | Next.js App Router のファイルベースルーティングを活用。ページコンポーネントは `"use client"` で Client Component として動作します。                              |
| **デザインシステム**           | CSS 変数 (`globals.css`) で色・タイポグラフィ・シャドウを一元管理し、Tailwind のユーティリティクラスと組み合わせて "Organic Luxury" なデザインを実現しています。 |

## 4. 状態管理

- **ローカル State 中心** — `useState` / `useCallback` を活用したコンポーネントローカルな状態管理。グローバルステートライブラリは不使用。
- **認証状態** — Firebase `onAuthStateChanged` でリスナーを張り、未認証時は `/login` へリダイレクト。
- **API 通信** — `apiClient` (Axios) がリクエスト時に Firebase ID トークンを自動付与。レスポンスは各ページの `useEffect` / `useCallback` で取得・保持。
- **キャッシュ** — レシピ詳細などは `recipeDetailMap` のようなオブジェクトで手動キャッシュし、同じデータの再取得を抑制。

## 5. 認証フロー

![Firebase Authentication Flow Diagram](/public/firebase_auth_flow.avif)

---

## 6. Features

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

## 7. API 通信

すべての API 呼び出しは `src/shared/lib/api.js` の `apiClient` (Axios インスタンス) を経由します。

- **ベース URL**: 環境変数 `NEXT_PUBLIC_API_URL` (未設定時は相対パス)
- **認証**: リクエストインターセプターが Firebase Auth の ID トークンを `Authorization: Bearer` ヘッダーに自動付与
- **主要エンドポイント**: `/api/members`, `/api/menus`, `/api/recipes`, `/api/stocks`, `/api/suggestions`, `/api/goods`, `/api/contacts` 等

---

## 8. Design System

`src/app/globals.css` に定義された CSS 変数ベースのデザインシステムです。

- **カラーパレット**: Terracotta / Sage / Cream / Gold / Warm Gray の 5 系統
- **セマンティックカラー**: `--primary`, `--secondary`, `--accent`, `--surface`, `--border` 等
- **タイポグラフィ**: 見出しは `Cormorant Garamond` (serif)、本文は `Outfit` (sans-serif)
- **コンポーネントクラス**: `.luxury-btn`, `.luxury-card`, `.luxury-input`, `.luxury-select` 等のプリセットクラス

---

## 9. Related Repositories

- **Backend (Rails API)**: 認証検証・データ永続化・AI 献立生成を担当
  https://github.com/YukiYonekura-321/famdish-front-react.git

## 10. テスト設計

### 10.1 テスト戦略

FamDish フロントエンドは、**ユーザーフロー・UI 動作・認証・API 連携** を重視した多層テスト戦略を採用しています。

| テスト層               | ツール                       | 対象                                       | 目的                                            | 実行タイミング           |
| ---------------------- | ---------------------------- | ------------------------------------------ | ----------------------------------------------- | ------------------------ |
| **ユニット**           | Jest                         | 個別コンポーネント・フック・ユーティリティ | 関数の純粋性・Edge Case 検証                    | `npm test` (CI)          |
| **インテグレーション** | Jest + React Testing Library | ページ単位・複数コンポーネント連携         | UI イベント・State 変更・API 呼び出しシーケンス | `npm test` (CI)          |
| **E2E（Smoke）**       | Playwright                   | 公開ページのみ（認証不要）                 | デプロイ後の基本動作確認                        | GitHub Actions (PR/main) |
| **E2E（機能）**        | Playwright                   | 認証フロー・献立提案・在庫管理等           | ユーザーシナリオ・複雑なフロー検証              | GitHub Actions (PR/main) |

---

### 10.2 テスト・CI状況

- CI/CDパイプライン通過

[![Frontend CI](https://github.com/YukiYonekura-321/famdish-front-react/actions/workflows/frontend.yml/badge.svg)](https://github.com/YukiYonekura-321/famdish-front-react/actions/workflows/frontend.yml)

- テストのカバレッジは81%

[![codecov](https://codecov.io/gh/YukiYonekura-321/famdish-front-react/graph/badge.svg?token=EPTAESJWLB)](https://codecov.io/gh/YukiYonekura-321/famdish-front-react)

---

### 10.3 ユニット テスト（Jest）

#### 対象

- **ユーティリティ関数**: `apiClient` の retry ロジック、トークン付与、エラーハンドリング
- **カスタムフック**: `useSuggestion()`, `useFeedback()`, `useAuth()` 等の State 遷移
- **Firebase ラッパー**: `connectAuthEmulator` の初期化フロー、Error Handling

#### 実行

```bash
docker compose exec frontend npm test
```

---

### 10.4 インテグレーション テスト（Jest + React Testing Library）

#### 対象

- **ページ全体**: UI 要素のレンダリング、ユーザーインタラクション、API 呼び出しモック
- **複数コンポーネント連携**: 親 → 子のデータフロー、Callback の発火
- **認証ガード**: 未認証時のリダイレクト、トークン失効時の再認証

#### 実行

```bash
docker compose exec frontend npm test -- src/app/members/__tests__/
```

---

### 10.5 E2E テスト（Playwright）

#### 構成

**3 つの Playwright プロジェクト**により異なるテストレベルを実現：

##### 📋 **Smoke テスト** (`--project=smoke`)

- **対象**: 公開ページのみ（認証不要）
  - トップページ、ログイン、ログインページ、規約、プライバシー、お問い合わせ
- **目的**: **デプロイ直後のサイト死活確認** （本番障害の即座の検知）
- **実行**: `npx playwright test --project=smoke`
- **理由**: **デプロイ前の「最後の砦」** — Vercel Preview や本番環境に対して、基本的な疎通 + アセット読み込みが成功しているかを即座に確認。ユーザーが真っ白ページを見ることを防ぐ。

##### ⚙️ **Chromium & Mobile Safari テスト** (`--project=chromium|mobile-safari`)

- **対象**: 認証フロー・献立提案など全機能
  - ログイン/登録 → プロフィール設定 → 献立提案 → 在庫管理 → 退会 等
- **目的**: **実ユーザーの完全なシナリオ検証** （複雑なフロー・複数パート間の連携）
- **実行**: `npx playwright test --project=chromium --project=mobile-safari`
- **理由**:
  - **マルチデバイス対応**: Desktop (Chromium) + Mobile (Safari) で、レスポンシブデザインが実際に動くか検証
  - **認証 → ページ間フロー**: トークン取得 → リダイレクト → API 呼び出し → 再認証 の一連を確認
  - **複雑な UX**: 献立提案の非同期ポーリング、モーダル遷移、フォーム入力の State 管理など実際に Playwright が操作する
  - **並列化**: CI で複数ワーカーが同時実行し、テスト時間を短縮

---

#### テスト実行環境

node.jsがローカル環境にインストールされていない場合は、インストールしてください。

その後、ローカル環境に必要なライブラリをインストールしてください。

```bash
# プロジェクトの依存パッケージをインストール（package.jsonに基づく）
 npm install

# Firebase CLIツールを開発用依存としてインストール
 npm install firebase-tools --save-dev

# Playwright実行に必要なOS依存ライブラリをインストール（Linux系で必要）
sudo npx playwright install-deps

# Chromiumブラウザ（テスト用）をインストール
npx playwright install chromium

# WebKitブラウザ（Safari相当のテスト用）をインストール
npx playwright install webkit
```

もう一つターミナルを開いて、npm run devコマンドでローカル環境にサーバを立ててください。

```bash
# 全 E2E テスト（smoke + chromium + mobile-safari）
npx playwright test

# Smoke のみ
npx playwright test --project=smoke

# Chromium のみ
npx playwright test --project=chromium

# 特定テストファイルのみ
npx playwright test e2e/tests/auth.spec.js

# デバッグモード（ブラウザ視認）
npx playwright test --debug
```

---

### 10.6 CI/CD パイプライン（GitHub Actions）

#### 実行される検査

```yaml
# .github/workflows/frontend.yml
jobs:
  lint:
    - ESLint で構文チェック・コード品質検査
  test:
    - Jest（ユニット + インテグレーション）
  build:
    - npm run build（本番ビルド）
  e2e-test:
    - Playwright E2E（localhost + Firebase Emulator）
    - smoke / chromium / mobile-safari 同時実行
```

#### テスト失敗時の対応

- **Lint** 失敗 → コードレビューで修正
- **Jest** 失敗 → ユーティリティ・フック の修正
- **Playwright** 失敗 → ページレイアウト・フロー・API モックの修正
- **Build** 失敗 → 環境変数・型エラー・依存関係の修正

---

### 10.7 テストカバレッジと除外

#### 現在カバーされている機能

✅ 認証フロー（登録・ログイン・ソーシャル認証・メールリンク）  
✅ プロフィール登録ウィザード（マルチステップ）  
✅ AI 献立提案（非同期ポーリング・フィードバック）  
✅ レシピ保存・採用  
✅ マイページ（SNS 連携・メール変更・退会）  
✅ 公開ページ（トップ・規約・プライバシー）

#### 未カバー

- リクエスト機能の E2E（UI テスト無し・API 連携のみ想定）
- コンポーネント単体の Snapshot テスト（リグレッションテスト未実装）
- パフォーマンステスト（Lighthouse）

### 10.8 テスト追加による成果

- E2E 追加後、デプロイ時のリグレッションが 0 に近づいた
