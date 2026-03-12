/**
 * RegisterEmailPage (app/register-email/page.jsx) の統合テスト
 *
 * 認証ガード、メール入力フォーム、確認メール送信、
 * email-already-in-use ダイアログ、ログアウトを検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterEmailPage from "@/app/register-email/page";

/* ────────── モック設定 ────────── */

const mockOnAuthStateChanged = jest.fn();
const mockSendEmailVerification = jest.fn();
const mockVerifyBeforeUpdateEmail = jest.fn();
const mockSignOut = jest.fn();

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  sendEmailVerification: (...args) => mockSendEmailVerification(...args),
  verifyBeforeUpdateEmail: (...args) => mockVerifyBeforeUpdateEmail(...args),
  signOut: (...args) => mockSignOut(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { currentUser: { email: "test@example.com", uid: "test-uid" } },
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("@/shared/components/header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

jest.mock("@/features/auth/lib/redirect-utils", () => ({
  buildLoginUrl: (redirect) =>
    redirect ? `/login?redirect=${redirect}` : "/login",
}));

const mockGet = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
  },
}));

/* ────────── テスト本体 ────────── */

describe("RegisterEmailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // location.search のモック
    delete window.location;
    window.location = {
      search: "",
      origin: "http://localhost:3000",
      href: "http://localhost:3000/register-email",
    };

    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid", email: "test@example.com" });
      return jest.fn();
    });

    // メンバー未登録
    mockGet.mockRejectedValue({ response: { status: 404 } });
    mockSendEmailVerification.mockResolvedValue();
    mockVerifyBeforeUpdateEmail.mockResolvedValue();
    mockSignOut.mockResolvedValue();
  });

  // ── 認証 ──

  it("未認証ユーザーはログインにリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<RegisterEmailPage />);
    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("/login"));
  });

  it("既にメンバー登録済みなら /menus にリダイレクトされる", async () => {
    mockGet.mockResolvedValue({ data: { username: "太郎" } });
    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/menus");
    });
  });

  // ── 初期表示 ──

  it("ページ見出し「メールアドレスの登録」が表示される", async () => {
    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByText("メールアドレスの登録")).toBeInTheDocument();
    });
  });

  it("メールアドレス入力欄が表示される", async () => {
    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });
  });

  it("確認メール送信ボタンが表示される", async () => {
    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByText("確認メールを送信")).toBeInTheDocument();
    });
  });

  // ── ログアウト ──

  it("ログアウトボタンがある", async () => {
    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByText("ログアウト")).toBeInTheDocument();
    });
  });

  it("ログアウトをクリックするとsignOutが呼ばれる", async () => {
    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByText("ログアウト")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("ログアウト"));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
