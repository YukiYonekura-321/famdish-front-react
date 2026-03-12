/**
 * MenuPage (app/menus/page.jsx) の統合テスト
 *
 * 認証ガード、初期データ取得、料理担当者選択、
 * 制約条件設定、献立提案を検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuPage from "@/app/menus/page";

/* ────────── モック設定 ────────── */

const mockOnAuthStateChanged = jest.fn();
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  isSignInWithEmailLink: () => false,
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { currentUser: { uid: "test-uid" } },
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => "/menus",
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

jest.mock("@/features/auth/lib/email-signin", () => ({
  handleEmailSignIn: jest.fn(),
}));

const mockFetchSuggestions = jest.fn();
const mockStopPolling = jest.fn();
jest.mock("@/features/menu/hooks/useSuggestion", () => ({
  useSuggestion: () => ({
    loading: false,
    suggestions: null,
    fetchSuggestions: mockFetchSuggestions,
    stopPolling: mockStopPolling,
  }),
}));

const mockSaveFeedback = jest.fn();
jest.mock("@/features/menu/hooks/useFeedback", () => ({
  useFeedback: () => ({
    saveFeedback: mockSaveFeedback,
  }),
}));

jest.mock("@/features/menu/components/SuggestionCard", () => {
  return function SuggestionCard() {
    return <div data-testid="suggestion-card">SuggestionCard</div>;
  };
});

jest.mock("@/features/menu/components/ConstraintToggle", () => ({
  ConstraintToggle: ({ constraintType, onSelect }) => (
    <div data-testid="constraint-toggle">
      <button onClick={() => onSelect("budget")}>budget</button>
      <button onClick={() => onSelect("time")}>time</button>
    </div>
  ),
}));

jest.mock("@/features/menu/components/StockBadges", () => ({
  StockBadges: ({ stocks }) => (
    <div data-testid="stock-badges">{stocks?.length || 0} items</div>
  ),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
}));

/* ────────── テストデータ ────────── */

const MEMBERS = [
  { id: 1, name: "太郎" },
  { id: 2, name: "花子" },
];

/* ────────── テスト本体 ────────── */

describe("MenuPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "prompt").mockReturnValue("理由テスト");

    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });

    // 初期データ API
    mockGet.mockImplementation((url) => {
      if (url === "/api/members") return Promise.resolve({ data: MEMBERS });
      if (url === "/api/members/me")
        return Promise.resolve({ data: { member: { id: 1 } } });
      if (url === "/api/families")
        return Promise.resolve({ data: { today_cook_id: 1 } });
      if (url === "/api/stocks")
        return Promise.resolve({ data: [{ id: 1, name: "卵" }] });
      return Promise.resolve({ data: {} });
    });

    mockPost.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    window.alert.mockRestore?.();
    window.prompt.mockRestore?.();
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<MenuPage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  // ── 初期表示 ──

  it("AuthHeader がレンダリングされている", () => {
    render(<MenuPage />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });

  it("AI提案の条件設定が表示される", () => {
    render(<MenuPage />);
    expect(screen.getByText("AI提案の条件設定")).toBeInTheDocument();
  });

  it("今日の料理担当者セレクトが表示される", () => {
    render(<MenuPage />);
    expect(screen.getByText("今日の料理担当者")).toBeInTheDocument();
  });

  it("提案ボタンが表示される", () => {
    render(<MenuPage />);
    expect(
      screen.getByText("今ある在庫から家族の好みを元に提案"),
    ).toBeInTheDocument();
  });

  // ── ナビゲーション ──

  it("わが家の献立リンクが表示される", () => {
    render(<MenuPage />);
    const link = screen.getByText("わが家の献立").closest("a");
    expect(link).toHaveAttribute("href", "/menus/familysuggestion");
  });

  it("みんなの献立を参考にするリンクが表示される", () => {
    render(<MenuPage />);
    const link = screen.getByText("みんなの献立を参考にする").closest("a");
    expect(link).toHaveAttribute("href", "/menus/familysuggestion/suggestion");
  });

  // ── 料理担当者選択 ──

  it("料理担当者を選択するとAPIが呼ばれる", async () => {
    render(<MenuPage />);

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(1);
    });

    // "今日の料理担当者" ラベルの次のselectを取得
    const selects = screen.getAllByRole("combobox");
    const cookSelect = selects[selects.length - 1]; // 最後のselect = 料理担当者
    fireEvent.change(cookSelect, { target: { value: "2" } });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/families/assign_cook", {
        member_id: 2,
      });
    });
  });

  // ── 献立提案 ──

  it("提案ボタンをクリックするとfetchSuggestionsが呼ばれる", async () => {
    render(<MenuPage />);

    fireEvent.click(screen.getByText("今ある在庫から家族の好みを元に提案"));

    await waitFor(() => {
      expect(mockFetchSuggestions).toHaveBeenCalled();
    });
  });
});
