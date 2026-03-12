/**
 * InvitePage (app/invite/[token]/page.jsx) の統合テスト
 *
 * 招待トークンによる招待情報取得、認証状態による表示切替、
 * 招待受諾・辞退、エラー表示を検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InvitePage from "@/app/invite/[token]/page";

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
  useParams: () => ({ token: "test-token-123" }),
}));

jest.mock("@/shared/components/header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
}));

/* ────────── テスト本体 ────────── */

describe("InvitePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    // デフォルト: 認証済み
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });
  });

  afterEach(() => {
    window.alert.mockRestore?.();
  });

  // ── ローディング状態 ──

  it("招待情報取得中にローディング表示される", () => {
    mockGet.mockReturnValue(new Promise(() => {})); // pending
    render(<InvitePage />);
    expect(screen.getByText("招待情報を確認中...")).toBeInTheDocument();
  });

  // ── 正常表示 ──

  it("有効な招待情報が表示される", async () => {
    mockGet.mockResolvedValue({
      data: { valid: true, family_name: "田中家" },
    });
    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("田中家")).toBeInTheDocument();
    });
    expect(screen.getByText("家族への招待")).toBeInTheDocument();
    expect(screen.getByText("から招待されています")).toBeInTheDocument();
  });

  it("認証済みユーザーに「招待を受け入れる」ボタンが表示される", async () => {
    mockGet.mockResolvedValue({
      data: { valid: true, family_name: "田中家" },
    });
    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("招待を受け入れる")).toBeInTheDocument();
    });
  });

  it("未認証ユーザーに「ログインして受け入れる」ボタンが表示される", async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    mockGet.mockResolvedValue({
      data: { valid: true, family_name: "田中家" },
    });
    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("ログインして受け入れる")).toBeInTheDocument();
    });
    expect(
      screen.getByText("招待を受諾するにはログインが必要です"),
    ).toBeInTheDocument();
  });

  // ── エラー ──

  it("無効なトークンでエラーが表示される", async () => {
    mockGet.mockResolvedValue({ data: { valid: false } });
    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("エラー")).toBeInTheDocument();
    });
    expect(
      screen.getByText("この招待リンクは無効または期限切れです"),
    ).toBeInTheDocument();
  });

  it("API失敗でエラーが表示される", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));
    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("エラー")).toBeInTheDocument();
    });
    expect(
      screen.getByText("招待情報の取得に失敗しました"),
    ).toBeInTheDocument();
  });

  // ── 招待受諾 ──

  it("招待受諾成功で /profile/step1 へ遷移する", async () => {
    mockGet.mockResolvedValue({
      data: { valid: true, family_name: "田中家" },
    });
    mockPost.mockResolvedValue({
      data: { family_name: "田中家", family_id: 1 },
    });

    const setItemSpy = jest.spyOn(
      Object.getPrototypeOf(sessionStorage),
      "setItem",
    );

    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("招待を受け入れる")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("招待を受け入れる"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/api/invitations/test-token-123/accept",
      );
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/profile/step1");
    });

    setItemSpy.mockRestore();
  });

  it("未認証ユーザーが受諾ボタンを押すとログインへリダイレクトされる", async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    mockGet.mockResolvedValue({
      data: { valid: true, family_name: "田中家" },
    });
    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("ログインして受け入れる")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("ログインして受け入れる"));
    expect(mockPush).toHaveBeenCalledWith(
      "/login?redirect=/invite/test-token-123",
    );
  });

  // ── 辞退 ──

  it("辞退ボタンで / へ遷移する", async () => {
    mockGet.mockResolvedValue({
      data: { valid: true, family_name: "田中家" },
    });
    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("辞退する")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("辞退する"));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  // ── ホームへ戻る ──

  it("エラー時に「ホームへ戻る」ボタンが動作する", async () => {
    mockGet.mockRejectedValue(new Error("fail"));
    render(<InvitePage />);
    await waitFor(() => {
      expect(screen.getByText("ホームへ戻る")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("ホームへ戻る"));
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
