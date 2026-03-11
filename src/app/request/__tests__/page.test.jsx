/**
 * RequestPage (app/request/page.jsx) の統合テスト
 *
 * メニューリクエスト CRUD（作成・編集・削除）、
 * いいね（Good）トグル、認証、エラーハンドリングを検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RequestPage from "@/app/request/page";

/* ────────── モック設定 ────────── */

const mockOnAuthStateChanged = jest.fn();
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  isSignInWithEmailLink: () => false,
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { currentUser: { uid: "test-uid" } },
}));

jest.mock("@/features/auth/lib/email-signin", () => ({
  handleEmailSignIn: jest.fn(),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => "/request",
}));

jest.mock("next/link", () => {
  return function Link({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("@/shared/components/auth_header", () => ({
  AuthHeader: () => <header data-testid="auth-header">AuthHeader</header>,
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    patch: (...args) => mockPatch(...args),
    delete: (...args) => mockDelete(...args),
  },
}));

/* ────────── テストデータ ────────── */

const LIKES = [
  { id: 1, name: "カレーライス" },
  { id: 2, name: "ハンバーグ" },
];

const MENUS = [
  { id: 10, name: "カレーライス", member: { name: "太郎" } },
  { id: 20, name: "オムライス", member: { name: "花子" } },
];

/* ────────── ヘルパー ────────── */

/** 認証済み + likes / menus を返すデフォルトセットアップ */
function setupDefaultMocks() {
  mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
    cb({ uid: "test-uid" });
    return jest.fn();
  });

  mockGet.mockImplementation((url) => {
    if (url === "/api/likes") return Promise.resolve({ data: LIKES });
    if (url === "/api/menus") return Promise.resolve({ data: MENUS });
    if (url === "/api/goods/check")
      return Promise.resolve({ data: { exists: false, good: null } });
    if (url === "/api/goods/count")
      return Promise.resolve({ data: { count: 0 } });
    return Promise.resolve({ data: {} });
  });
}

/* ────────── テスト本体 ────────── */

describe("RequestPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
    // scrollIntoView はテスト環境に存在しない
    Element.prototype.scrollIntoView = jest.fn();
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<RequestPage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  // ── 初期表示 ──

  it("ページ見出しを表示する", async () => {
    render(<RequestPage />);
    expect(
      screen.getByText("食べたいものをリクエストしよう！"),
    ).toBeInTheDocument();
  });

  it("AuthHeader がレンダリングされている", () => {
    render(<RequestPage />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });

  it("好きなもの(likes)がドロップダウンに表示される", async () => {
    render(<RequestPage />);

    // select 要素を取得
    const select = screen.getByRole("combobox");

    // option 要素をチェック
    await waitFor(() => {
      const options = select.querySelectorAll("option");
      const optionTexts = Array.from(options).map((o) => o.textContent);
      expect(optionTexts).toContain("カレーライス");
      expect(optionTexts).toContain("ハンバーグ");
    });
  });

  it("メニュー一覧が表示される", async () => {
    render(<RequestPage />);
    await waitFor(() => {
      expect(screen.getByText("オムライス")).toBeInTheDocument();
    });
  });

  // ── メニュー作成 ──

  it("テキスト入力でメニューを作成できる", async () => {
    mockPost.mockResolvedValue({ data: {} });
    // 作成後の再取得
    mockGet.mockImplementation((url) => {
      if (url === "/api/likes") return Promise.resolve({ data: LIKES });
      if (url === "/api/menus")
        return Promise.resolve({
          data: [...MENUS, { id: 30, name: "唐揚げ" }],
        });
      if (url === "/api/goods/check")
        return Promise.resolve({ data: { exists: false, good: null } });
      if (url === "/api/goods/count")
        return Promise.resolve({ data: { count: 0 } });
      return Promise.resolve({ data: {} });
    });

    render(<RequestPage />);

    // テキスト入力
    const input = screen.getByPlaceholderText("例: カレーライス");
    fireEvent.change(input, { target: { value: "唐揚げ" } });

    // 送信
    fireEvent.click(screen.getByText("リクエストを送信"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/menus", {
        menu: { name: "唐揚げ" },
      });
    });
  });

  it("作成成功時にメッセージを表示する", async () => {
    mockPost.mockResolvedValue({ data: {} });
    render(<RequestPage />);

    fireEvent.change(screen.getByPlaceholderText("例: カレーライス"), {
      target: { value: "唐揚げ" },
    });
    fireEvent.click(screen.getByText("リクエストを送信"));

    await waitFor(() => {
      expect(
        screen.getByText("リクエストを送信しました！"),
      ).toBeInTheDocument();
    });
  });

  it("作成失敗時にエラーメッセージを表示する", async () => {
    mockPost.mockRejectedValue({
      response: { data: { errors: ["同じメニューが存在します"] } },
    });
    render(<RequestPage />);

    fireEvent.change(screen.getByPlaceholderText("例: カレーライス"), {
      target: { value: "カレーライス" },
    });
    fireEvent.click(screen.getByText("リクエストを送信"));

    await waitFor(() => {
      expect(screen.getByText(/同じメニューが存在します/)).toBeInTheDocument();
    });
  });

  it("空文字では送信ボタンが無効化される", () => {
    render(<RequestPage />);
    const btn = screen.getByText("リクエストを送信");
    expect(btn).toBeDisabled();
  });

  // ── 編集 ──

  it("編集ボタンから編集モーダルを開き、保存できる", async () => {
    mockPatch.mockResolvedValue({ data: {} });
    render(<RequestPage />);

    await waitFor(() => {
      expect(screen.getByText("オムライス")).toBeInTheDocument();
    });

    // 「編集」ボタンをクリック
    const editButtons = screen.getAllByText("編集");
    fireEvent.click(editButtons[0]);

    // 編集モーダルが出現
    await waitFor(() => {
      expect(screen.getByText("メニューを編集")).toBeInTheDocument();
    });

    // 値を変更して保存
    const input = screen.getByDisplayValue("カレーライス");
    fireEvent.change(input, { target: { value: "グリーンカレー" } });
    fireEvent.click(screen.getByText("保存"));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith("/api/menus/10", {
        menu: { name: "グリーンカレー" },
      });
    });
  });

  it("編集モーダルのキャンセルで閉じる", async () => {
    render(<RequestPage />);

    await waitFor(() => {
      expect(screen.getByText("オムライス")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("編集")[0]);
    await waitFor(() => {
      expect(screen.getByText("メニューを編集")).toBeInTheDocument();
    });

    // キャンセルボタン（モーダル内の）
    const modalCancelButtons = screen.getAllByText("キャンセル");
    fireEvent.click(modalCancelButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("メニューを編集")).not.toBeInTheDocument();
    });
  });

  // ── 削除 ──

  it("削除ボタンで確認モーダルが表示され、削除が実行される", async () => {
    mockDelete.mockResolvedValue({});
    render(<RequestPage />);

    await waitFor(() => {
      expect(screen.getByText("オムライス")).toBeInTheDocument();
    });

    // 「削除」ボタンをクリック
    const deleteButtons = screen.getAllByText("削除");
    fireEvent.click(deleteButtons[0]);

    // 確認モーダルが表示される
    await waitFor(() => {
      expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
    });

    // 「削除する」ボタンをクリック
    fireEvent.click(screen.getByText("削除する"));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("/api/menus/10");
    });
  });

  it("削除確認モーダルで「キャンセル」すると閉じる", async () => {
    render(<RequestPage />);

    await waitFor(() => {
      expect(screen.getByText("オムライス")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("削除")[0]);
    await waitFor(() => {
      expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("キャンセル")[0]);

    await waitFor(() => {
      expect(
        screen.queryByText("本当に削除しますか？"),
      ).not.toBeInTheDocument();
    });
  });

  // ── いいね(Good)トグル ──

  it("いいねアイコンのクリックで Good を作成する", async () => {
    mockPost.mockResolvedValue({ data: { id: 100 } });
    render(<RequestPage />);

    // メニュー一覧が表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText("オムライス")).toBeInTheDocument();
    });

    // ハートアイコン（🤍）をクリック
    const hearts = screen.getAllByText("🤍");
    fireEvent.click(hearts[0]);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/goods", {
        good: { menu_id: 10 },
      });
    });
  });

  // ── ナビゲーション ──

  it("メニュー提案ページへのリンクがある", () => {
    render(<RequestPage />);
    const link = screen.getByText("メニュー提案ページへ移動").closest("a");
    expect(link).toHaveAttribute("href", "/menus");
  });
});
