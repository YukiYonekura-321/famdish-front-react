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
let mockSuggestionLoading = false;
let mockSuggestions = null;
jest.mock("@/features/menu/hooks/useSuggestion", () => ({
  useSuggestion: () => ({
    loading: mockSuggestionLoading,
    suggestions: mockSuggestions,
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
  return function SuggestionCard({ onOk, onRetry, onNg }) {
    return (
      <div data-testid="suggestion-card">
        <button data-testid="ok-btn" onClick={onOk}>
          採用
        </button>
        <button data-testid="retry-btn" onClick={onRetry}>
          別案
        </button>
        <button data-testid="ng-btn" onClick={onNg}>
          NG
        </button>
      </div>
    );
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

    mockSuggestionLoading = false;
    mockSuggestions = null;
    mockFetchSuggestions.mockResolvedValue();
    mockSaveFeedback.mockResolvedValue();

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

  // ── 制約条件切替 ──

  it("制約タイプを「time」に切替えると調理時間セレクトが表示される", async () => {
    render(<MenuPage />);

    fireEvent.click(screen.getByText("time"));

    await waitFor(() => {
      expect(screen.getByText("⏱️ 希望調理時間")).toBeInTheDocument();
    });
  });

  it("制約タイプを切替えると前の値がリセットされる", async () => {
    render(<MenuPage />);

    // budget を選択
    const budgetSelect = screen.getByDisplayValue("指定なし");
    fireEvent.change(budgetSelect, { target: { value: "1000" } });

    // time に切替え
    fireEvent.click(screen.getByText("time"));

    // budget に戻す
    fireEvent.click(screen.getByText("budget"));

    // 値がリセットされている
    const selects = screen.getAllByDisplayValue("指定なし");
    expect(selects.length).toBeGreaterThan(0);
  });

  // ── 制約条件付き提案 ──

  it("予算を設定して提案するとgetConstraintsにbudgetが含まれる", async () => {
    render(<MenuPage />);

    // 予算セレクトを変更
    const budgetSelect = screen.getByDisplayValue("指定なし");
    fireEvent.change(budgetSelect, { target: { value: "1000" } });

    fireEvent.click(screen.getByText("今ある在庫から家族の好みを元に提案"));

    await waitFor(() => {
      expect(mockFetchSuggestions).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ budget: 1000 }),
      );
    });
  });

  it("調理時間を設定して提案するとcooking_timeが含まれる", async () => {
    render(<MenuPage />);

    // time に切替え
    fireEvent.click(screen.getByText("time"));

    await waitFor(() => {
      expect(screen.getByText("⏱️ 希望調理時間")).toBeInTheDocument();
    });

    // 調理時間セレクトを変更
    const timeSelects = screen.getAllByDisplayValue("指定なし");
    const timeSelect = timeSelects[0];
    fireEvent.change(timeSelect, { target: { value: "30" } });

    fireEvent.click(screen.getByText("今ある在庫から家族の好みを元に提案"));

    await waitFor(() => {
      expect(mockFetchSuggestions).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ cooking_time: 30 }),
      );
    });
  });

  // ── fetchSuggestions エラーハンドリング ──

  it("提案取得で403エラーの場合に担当者変更のアラートが表示される", async () => {
    mockFetchSuggestions.mockRejectedValue({ status: 403 });
    render(<MenuPage />);

    fireEvent.click(screen.getByText("今ある在庫から家族の好みを元に提案"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "料理担当者ではありません。料理担当者を変更してください。",
      );
    });
  });

  it("提案取得で一般エラーの場合にエラーメッセージが表示される", async () => {
    mockFetchSuggestions.mockRejectedValue({
      status: 500,
      message: "サーバーエラー",
    });
    render(<MenuPage />);

    fireEvent.click(screen.getByText("今ある在庫から家族の好みを元に提案"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("提案取得に失敗しました"),
      );
    });
  });

  // ── ローディング表示 ──

  it("loading中はスピナーとメッセージが表示される", () => {
    mockSuggestionLoading = true;
    render(<MenuPage />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(
      screen.getByText((text) => text.includes("AIが献立を考えています")),
    ).toBeInTheDocument();
  });

  // ── SuggestionCard表示 ──

  it("suggestionsがあるとSuggestionCardが表示される", () => {
    mockSuggestions = {
      id: 1,
      suggest_field: { title: "カレー", reason: "美味しい" },
    };
    render(<MenuPage />);
    expect(screen.getByTestId("suggestion-card")).toBeInTheDocument();
  });

  // ── 料理担当者選択のエラー ──

  it("料理担当者設定APIが失敗するとエラーメッセージが表示される", async () => {
    mockPost.mockRejectedValueOnce(new Error("API error"));
    render(<MenuPage />);

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(1);
    });

    const selects = screen.getAllByRole("combobox");
    const cookSelect = selects[selects.length - 1];
    fireEvent.change(cookSelect, { target: { value: "2" } });

    await waitFor(() => {
      expect(
        screen.getByText("料理担当者の設定に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  // ── 提案採用（handleAcceptSuggestion） ──

  it("提案を採用すると saveFeedback → recipes POST → 遷移が行われる", async () => {
    mockSuggestions = {
      id: 42,
      suggest_field: [{ title: "カレー", reason: "美味しい" }],
    };

    render(<MenuPage />);

    // 初期データ読み込み待機（メンバー名が表示されれば todayCookId, myMemberId もセット済み）
    await waitFor(() => {
      expect(screen.getByText("太郎")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("ok-btn"));

    await waitFor(() => {
      expect(mockSaveFeedback).toHaveBeenCalledWith(42, "ok", "");
    });
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/api/recipes",
        expect.objectContaining({ dish_name: "カレー" }),
      );
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/menus/familysuggestion");
    });
  });

  it("料理担当者未設定で採用するとアラートが表示される", async () => {
    mockSuggestions = {
      id: 42,
      suggest_field: [{ title: "カレー", reason: "美味しい" }],
    };
    // today_cook_id を null に
    mockGet.mockImplementation((url) => {
      if (url === "/api/members") return Promise.resolve({ data: MEMBERS });
      if (url === "/api/members/me")
        return Promise.resolve({ data: { member: { id: 1 } } });
      if (url === "/api/families")
        return Promise.resolve({ data: { today_cook_id: null } });
      if (url === "/api/stocks") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });

    render(<MenuPage />);

    await waitFor(() => {
      expect(screen.getByTestId("suggestion-card")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("ok-btn"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "料理担当者が設定されていません。料理担当者を設定してください。",
      );
    });
  });

  it("他のメンバーが料理担当者の場合は採用できない", async () => {
    mockSuggestions = {
      id: 42,
      suggest_field: [{ title: "カレー", reason: "美味しい" }],
    };
    // myMemberId=1, todayCookId=2（別人）
    mockGet.mockImplementation((url) => {
      if (url === "/api/members") return Promise.resolve({ data: MEMBERS });
      if (url === "/api/members/me")
        return Promise.resolve({ data: { member: { id: 1 } } });
      if (url === "/api/families")
        return Promise.resolve({ data: { today_cook_id: 2 } });
      if (url === "/api/stocks") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });

    render(<MenuPage />);

    await waitFor(() => {
      expect(screen.getByTestId("suggestion-card")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("ok-btn"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("本日の料理担当者"),
      );
    });
  });

  // ── 別案要求（handleRetry） ──

  it("別案ボタンをクリックするとsaveFeedbackとfetchSuggestionsが呼ばれる", async () => {
    mockSuggestions = {
      id: 42,
      suggest_field: { title: "カレー", reason: "美味しい" },
    };
    mockSaveFeedback.mockResolvedValue();

    render(<MenuPage />);

    fireEvent.click(screen.getByTestId("retry-btn"));

    await waitFor(() => {
      expect(mockSaveFeedback).toHaveBeenCalledWith(42, "alt", "");
    });
    expect(window.alert).toHaveBeenCalledWith("別案を要求しました");
    expect(mockFetchSuggestions).toHaveBeenCalledWith(42, expect.any(Object));
  });

  // ── NG送信（handleNg） ──

  it("NGボタンをクリックするとpromptで理由を聞きsaveFeedbackが呼ばれる", async () => {
    mockSuggestions = {
      id: 42,
      suggest_field: { title: "カレー", reason: "美味しい" },
    };
    mockSaveFeedback.mockResolvedValue();

    render(<MenuPage />);

    fireEvent.click(screen.getByTestId("ng-btn"));

    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalled();
    });
    expect(mockSaveFeedback).toHaveBeenCalledWith(42, "ng", "理由テスト");
    expect(window.alert).toHaveBeenCalledWith("NG理由を送信しました");
    expect(mockFetchSuggestions).toHaveBeenCalledWith(42, expect.any(Object));
  });

  // ── 初期データ取得エラー ──

  it("初期データ取得でエラーが発生してもクラッシュしない", async () => {
    mockGet.mockRejectedValue(new Error("network error"));
    render(<MenuPage />);
    // クラッシュしなければOK
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });
});
