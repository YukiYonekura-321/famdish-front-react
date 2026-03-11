/**
 * StockPage (app/stock/page.jsx) の統合テスト
 *
 * 在庫管理ページの CRUD 操作（追加・更新・削除）、
 * 認証ガード、バリデーション、エラーハンドリングを検証する。
 */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import StockPage from "@/app/stock/page";

/* ────────── モック設定 ────────── */

const mockOnAuthStateChanged = jest.fn();
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: {},
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => "/stock",
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

const STOCKS = [
  { id: 1, name: "卵", quantity: 6, unit: "個" },
  { id: 2, name: "牛乳", quantity: 500, unit: "ml" },
  { id: 3, name: "玉ねぎ", quantity: 3, unit: "個" },
];

/* ────────── テスト本体 ────────── */

describe("StockPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルト: 認証済み + 在庫データあり
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });
    mockGet.mockResolvedValue({ data: STOCKS });
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<StockPage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("認証済みユーザーで在庫一覧を取得する", async () => {
    render(<StockPage />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/api/stocks");
    });
  });

  // ── 初期表示 ──

  it("ページ見出し「冷蔵庫の中身」を表示する", async () => {
    render(<StockPage />);
    expect(screen.getByText("冷蔵庫の中身")).toBeInTheDocument();
  });

  it("AuthHeader がレンダリングされている", () => {
    render(<StockPage />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });

  it("在庫データが一覧に表示される", async () => {
    render(<StockPage />);
    await waitFor(() => {
      expect(screen.getByText("卵")).toBeInTheDocument();
    });
    expect(screen.getByText("牛乳")).toBeInTheDocument();
    expect(screen.getByText("玉ねぎ")).toBeInTheDocument();
  });

  it("在庫が空のとき「まだ食材が登録されていません」を表示する", async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<StockPage />);
    await waitFor(() => {
      expect(
        screen.getByText("まだ食材が登録されていません"),
      ).toBeInTheDocument();
    });
  });

  it("在庫取得失敗時にエラーメッセージを表示する", async () => {
    mockGet.mockRejectedValue(new Error("network error"));
    render(<StockPage />);
    await waitFor(() => {
      expect(screen.getByText("在庫の取得に失敗しました")).toBeInTheDocument();
    });
  });

  // ── 追加 ──

  it("プリセット食材を選択して追加できる", async () => {
    mockPost.mockResolvedValue({
      data: { id: 4, name: "卵", quantity: 3, unit: "個" },
    });
    render(<StockPage />);

    await waitFor(() => {
      expect(screen.getByText("卵")).toBeInTheDocument();
    });

    // 食材選択
    const select = screen.getByDisplayValue("-- 食材を選んでください --");
    fireEvent.change(select, { target: { value: "卵" } });

    // 量を選択
    await waitFor(() => {
      expect(screen.getByDisplayValue("-- 量を選択 --")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByDisplayValue("-- 量を選択 --"), {
      target: { value: "3" },
    });

    // 追加ボタンをクリック
    fireEvent.click(screen.getByText("🛒 食材を追加する"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/stocks", {
        stock: { name: "卵", quantity: 3, unit: "個" },
      });
    });
  });

  it("カスタム食材を入力して追加できる", async () => {
    mockPost.mockResolvedValue({
      data: { id: 5, name: "アボカド", quantity: 2, unit: "個" },
    });
    render(<StockPage />);

    await waitFor(() => {
      expect(screen.getByText("卵")).toBeInTheDocument();
    });

    // 「自分で入力する」を選択
    const select = screen.getByDisplayValue("-- 食材を選んでください --");
    fireEvent.change(select, { target: { value: "__custom__" } });

    // 食材名を入力
    await waitFor(() => {
      expect(screen.getByPlaceholderText("例：アボカド")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("例：アボカド"), {
      target: { value: "アボカド" },
    });

    // 量を選択
    fireEvent.change(screen.getByDisplayValue("-- 量を選択 --"), {
      target: { value: "2" },
    });

    // 単位を選択
    fireEvent.change(screen.getByDisplayValue("-- 単位を選択 --"), {
      target: { value: "個" },
    });

    // 追加ボタンをクリック
    fireEvent.click(screen.getByText("🛒 食材を追加する"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/stocks", {
        stock: { name: "アボカド", quantity: 2, unit: "個" },
      });
    });
  });

  it("追加成功時にサクセスメッセージが表示される", async () => {
    mockPost.mockResolvedValue({
      data: { id: 4, name: "卵", quantity: 3, unit: "個" },
    });
    render(<StockPage />);

    await waitFor(() => {
      expect(screen.getByText("卵")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByDisplayValue("-- 食材を選んでください --"), {
      target: { value: "卵" },
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue("-- 量を選択 --")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByDisplayValue("-- 量を選択 --"), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByText("🛒 食材を追加する"));

    await waitFor(() => {
      expect(screen.getByText("卵 を追加しました")).toBeInTheDocument();
    });
  });

  it("追加失敗時にエラーメッセージを表示する", async () => {
    mockPost.mockRejectedValue({
      response: { data: { error: "同じ食材が既に登録されています" } },
    });
    render(<StockPage />);

    await waitFor(() => {
      expect(screen.getByText("卵")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByDisplayValue("-- 食材を選んでください --"), {
      target: { value: "卵" },
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue("-- 量を選択 --")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByDisplayValue("-- 量を選択 --"), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByText("🛒 食材を追加する"));

    await waitFor(() => {
      expect(
        screen.getByText("同じ食材が既に登録されています"),
      ).toBeInTheDocument();
    });
  });

  // ── 更新 ──

  it("数量変更ボタンで編集モードに切り替わり、保存できる", async () => {
    mockPatch.mockResolvedValue({
      data: { id: 1, name: "卵", quantity: 10, unit: "個" },
    });
    render(<StockPage />);

    await waitFor(() => {
      expect(screen.getByText("卵")).toBeInTheDocument();
    });

    // 「✏️ 数量変更」ボタンをクリック（最初の在庫アイテム）
    const editButtons = screen.getAllByText("✏️ 数量変更");
    fireEvent.click(editButtons[0]);

    // 数量入力欄が表示されるのを待つ
    const input = await screen.findByDisplayValue("6");
    expect(input).toHaveAttribute("type", "number");

    // 「保存」「キャンセル」ボタンが表示される
    expect(screen.getByText("保存")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();

    // 値を変更
    fireEvent.change(input, { target: { value: "10" } });

    // 保存ボタンをクリック — 値変更後の再レンダリングを待つ
    await waitFor(() => {
      fireEvent.click(screen.getByText("保存"));
    });

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith("/api/stocks/1", {
        stock: { quantity: 10 },
      });
    });
  });

  it("編集モードで「キャンセル」すると元に戻る", async () => {
    render(<StockPage />);

    await waitFor(() => {
      expect(screen.getByText("卵")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText("✏️ 数量変更");
    fireEvent.click(editButtons[0]);

    // 再レンダリングを待って「キャンセル」ボタンをクリック
    await waitFor(() => {
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("キャンセル"));

    // 編集モードが閉じて「✏️ 数量変更」ボタンが再表示
    await waitFor(() => {
      expect(screen.getAllByText("✏️ 数量変更")).toHaveLength(3);
    });
  });

  // ── 削除 ──

  it("削除ボタンで確認モーダルが表示され、削除が実行される", async () => {
    mockDelete.mockResolvedValue({});
    render(<StockPage />);

    await waitFor(() => {
      expect(screen.getByText("卵")).toBeInTheDocument();
    });

    // 🗑️ ボタンをクリック
    const deleteButtons = screen.getAllByText("🗑️");
    fireEvent.click(deleteButtons[0]);

    // 確認モーダルが表示される
    await waitFor(() => {
      expect(screen.getByText("「卵」を削除しますか？")).toBeInTheDocument();
    });

    // 「削除する」ボタンをクリック
    fireEvent.click(screen.getByText("削除する"));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("/api/stocks/1");
    });
  });

  it("削除確認モーダルで「キャンセル」すると閉じる", async () => {
    render(<StockPage />);

    await waitFor(() => {
      expect(screen.getByText("卵")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("🗑️");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("「卵」を削除しますか？")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("キャンセル"));

    await waitFor(() => {
      expect(
        screen.queryByText("「卵」を削除しますか？"),
      ).not.toBeInTheDocument();
    });
  });

  // ── ナビゲーション ──

  it("メニュー提案ページへのリンクがある", async () => {
    render(<StockPage />);
    const link = screen.getByText("メニュー提案ページへ").closest("a");
    expect(link).toHaveAttribute("href", "/menus");
  });

  it("わが家の献立へのリンクがある", async () => {
    render(<StockPage />);
    const link = screen.getByText("わが家の献立へ").closest("a");
    expect(link).toHaveAttribute("href", "/menus/familysuggestion");
  });
});
