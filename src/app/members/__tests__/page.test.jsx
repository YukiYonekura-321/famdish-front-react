/**
 * CreateInvitePage (app/members/page.jsx) の統合テスト
 *
 * 招待リンク生成、認証ガード、メンバー情報取得、
 * 未登録時リダイレクト、エラー表示を検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateInvitePage from "@/app/members/page";

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
  usePathname: () => "/members",
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
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
}));

jest.mock("@/features/member/components/AmbientBackground", () => ({
  AmbientBackground: () => <div data-testid="ambient-bg" />,
}));

jest.mock("@/features/member/components/InfoItem", () => ({
  InfoItem: ({ icon, text }) => (
    <li data-testid="info-item">
      {icon} {text}
    </li>
  ),
}));

jest.mock("@/features/member/components/FamilyInfoBadge", () => ({
  FamilyInfoBadge: ({ familyName }) => (
    <div data-testid="family-badge">{familyName}</div>
  ),
}));

jest.mock("@/features/member/components/ErrorBanner", () => ({
  ErrorBanner: ({ message }) =>
    message ? <div data-testid="error-banner">{message}</div> : null,
}));

jest.mock("@/features/member/components/LinkSection", () => ({
  LinkSection: ({ inviteUrl, copied, onCopy }) => (
    <div data-testid="link-section">
      <span>{inviteUrl}</span>
      <button onClick={onCopy}>{copied ? "コピー済み" : "コピー"}</button>
    </div>
  ),
}));

jest.mock("@/features/member/components/QRCodeSection", () => ({
  QRCodeSection: ({ inviteUrl, onDownload }) => (
    <div data-testid="qr-section">
      <span>{inviteUrl}</span>
      <button onClick={onDownload}>QRダウンロード</button>
    </div>
  ),
}));

jest.mock("@/features/member/lib/helpers", () => ({
  formatExpiresAt: (date) => `期限: ${date}`,
}));

/* ────────── テスト本体 ────────── */

describe("CreateInvitePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });
    mockGet.mockResolvedValue({
      data: { member: { id: 1, name: "太郎" }, family_name: "田中家" },
    });
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
    render(<CreateInvitePage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("メンバー未登録の場合は /profile/step1 にリダイレクトされる", async () => {
    mockGet.mockResolvedValue({ data: {} });
    render(<CreateInvitePage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/profile/step1");
    });
  });

  // ── 初期表示 ──

  it("ページ見出し「家族への招待」が表示される", async () => {
    render(<CreateInvitePage />);
    await waitFor(() => {
      expect(screen.getByText("家族への招待")).toBeInTheDocument();
    });
  });

  it("AuthHeader がレンダリングされている", async () => {
    render(<CreateInvitePage />);
    await waitFor(() => {
      expect(screen.getByTestId("auth-header")).toBeInTheDocument();
    });
  });

  it("招待リンク生成ボタンが表示される", async () => {
    render(<CreateInvitePage />);
    await waitFor(() => {
      expect(screen.getByText("招待リンクを生成")).toBeInTheDocument();
    });
  });

  it("メンバー一覧へのリンクが表示される", async () => {
    render(<CreateInvitePage />);
    await waitFor(() => {
      const link = screen.getByText("メンバー一覧を見る").closest("a");
      expect(link).toHaveAttribute("href", "/members/index");
    });
  });

  // ── 招待リンク生成 ──

  it("招待リンク生成に成功するとリンクが表示される", async () => {
    mockPost.mockResolvedValue({
      data: {
        invite_url: "https://example.com/invite/abc",
        expires_at: "2026-03-19",
      },
    });

    render(<CreateInvitePage />);
    await waitFor(() => {
      expect(screen.getByText("招待リンクを生成")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("招待リンクを生成"));

    await waitFor(() => {
      expect(screen.getByText("招待リンクを生成しました")).toBeInTheDocument();
    });
    expect(screen.getByTestId("link-section")).toBeInTheDocument();
    expect(screen.getByTestId("qr-section")).toBeInTheDocument();
  });

  it("招待リンク生成に失敗するとエラーが表示される", async () => {
    mockPost.mockRejectedValue({
      response: { data: { error: "生成失敗" } },
    });

    render(<CreateInvitePage />);
    await waitFor(() => {
      expect(screen.getByText("招待リンクを生成")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("招待リンクを生成"));

    await waitFor(() => {
      expect(screen.getByTestId("error-banner")).toBeInTheDocument();
    });
  });

  // ── メンバー一覧へボタン ──

  it("生成後に「メンバー一覧へ」ボタンで遷移する", async () => {
    mockPost.mockResolvedValue({
      data: {
        invite_url: "https://example.com/invite/abc",
        expires_at: "2026-03-19",
      },
    });

    render(<CreateInvitePage />);
    await waitFor(() => {
      expect(screen.getByText("招待リンクを生成")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("招待リンクを生成"));

    await waitFor(() => {
      expect(screen.getByText("メンバー一覧へ")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("メンバー一覧へ"));
    expect(mockPush).toHaveBeenCalledWith("/members/index");
  });
});
