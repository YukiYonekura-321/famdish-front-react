/**
 * AllSuggestionsPage (app/menus/familysuggestion/suggestion/page.jsx) の統合テスト
 *
 * 認証ガード、全献立一覧取得、いいねトグル、
 * 空リスト表示を検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AllSuggestionsPage from "@/app/menus/familysuggestion/suggestion/page";

/* ────────── モック設定 ────────── */

const mockOnAuthStateChanged = jest.fn();
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({ auth: {} }));

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => "/menus/familysuggestion/suggestion",
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

jest.mock("@/shared/components/LoadingSpinner", () => {
  return function LoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock("@/features/menu/components/PublicSuggestionCard", () => ({
  PublicSuggestionCard: ({
    suggestion,
    goodStatus,
    goodCount,
    onToggleGood,
  }) => (
    <div data-testid={`suggestion-card-${suggestion.id}`}>
      <span>{suggestion.dish_name}</span>
      <span data-testid={`good-count-${suggestion.id}`}>{goodCount || 0}</span>
      <button onClick={() => onToggleGood(suggestion.id)}>いいね</button>
    </div>
  ),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    delete: (...args) => mockDelete(...args),
  },
}));

/* ────────── テストデータ ────────── */

const SUGGESTIONS = [
  { id: 1, dish_name: "唐揚げ" },
  { id: 2, dish_name: "親子丼" },
];

/* ────────── テスト本体 ────────── */

describe("AllSuggestionsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});

    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });

    mockGet.mockImplementation((url) => {
      if (url === "/api/members/all")
        return Promise.resolve({ data: [{ id: 1, name: "太郎" }] });
      if (url === "/api/recipes") return Promise.resolve({ data: SUGGESTIONS });
      if (url === "/api/goods/check_suggestion")
        return Promise.resolve({ data: { exists: false, good: null } });
      if (url === "/api/goods/count_suggestion")
        return Promise.resolve({ data: { count: 5 } });
      return Promise.resolve({ data: {} });
    });

    mockPost.mockResolvedValue({ data: { id: 99 } });
    mockDelete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    window.alert.mockRestore?.();
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<AllSuggestionsPage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  // ── 初期表示 ──

  it("ページ見出し「みんなの献立」が表示される", async () => {
    render(<AllSuggestionsPage />);
    await waitFor(() => {
      expect(
        screen.getByText((text) => text.includes("みんなの献立")),
      ).toBeInTheDocument();
    });
  });

  it("AuthHeader がレンダリングされている", () => {
    render(<AllSuggestionsPage />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });

  it("献立一覧が表示される", async () => {
    render(<AllSuggestionsPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });
    expect(screen.getByText("親子丼")).toBeInTheDocument();
  });

  // ── 空リスト ──

  it("献立がない場合にメッセージが表示される", async () => {
    mockGet.mockImplementation((url) => {
      if (url === "/api/members/all") return Promise.resolve({ data: [] });
      if (url === "/api/recipes") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });
    render(<AllSuggestionsPage />);
    await waitFor(() => {
      expect(
        screen.getByText("まだ採用された献立がありません"),
      ).toBeInTheDocument();
    });
  });

  // ── ナビゲーション ──

  it("わが家の献立に戻るリンクがある", () => {
    render(<AllSuggestionsPage />);
    const link = screen.getByText("わが家の献立に戻る").closest("a");
    expect(link).toHaveAttribute("href", "/menus/familysuggestion");
  });

  // ── いいねトグル ──

  it("いいねボタンをクリックするとAPIが呼ばれる", async () => {
    render(<AllSuggestionsPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const likeButtons = screen.getAllByText("いいね");
    fireEvent.click(likeButtons[0]);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/goods/create_suggestion", {
        suggestion_id: 1,
      });
    });
  });
});
