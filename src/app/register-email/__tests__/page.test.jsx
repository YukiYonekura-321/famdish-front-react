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
  auth: {
    currentUser: {
      email: "test@example.com",
      uid: "test-uid",
      delete: jest.fn().mockResolvedValue(),
    },
  },
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

  // ── 同じメールで確認メール送信（sendEmailVerification） ──

  it("同じメールアドレスでフォーム送信するとsendEmailVerificationが呼ばれる", async () => {
    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    // メールが自動入力される（test@example.com）のでそのまま送信
    fireEvent.submit(screen.getByText("確認メールを送信").closest("form"));

    await waitFor(() => {
      expect(mockSendEmailVerification).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(
        screen.getByText((t) => t.includes("確認メールを送りました")),
      ).toBeInTheDocument();
    });
  });

  it("sendEmailVerification失敗時にエラーメッセージが表示される", async () => {
    mockSendEmailVerification.mockRejectedValue({
      message: "送信エラー",
    });

    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByText("確認メールを送信").closest("form"));

    await waitFor(() => {
      expect(
        screen.getByText((t) => t.includes("メールの送信に失敗しました")),
      ).toBeInTheDocument();
    });
  });

  // ── 異なるメールで確認メール送信（verifyBeforeUpdateEmail） ──

  it("異なるメールアドレスで送信するとverifyBeforeUpdateEmailが呼ばれる", async () => {
    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("メールアドレス");
    fireEvent.change(input, { target: { value: "new@example.com" } });

    fireEvent.submit(screen.getByText("確認メールを送信").closest("form"));

    await waitFor(() => {
      expect(mockVerifyBeforeUpdateEmail).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(
        screen.getByText((t) => t.includes("確認メールを送りました")),
      ).toBeInTheDocument();
    });
  });

  // ── email-already-in-use エラー → 確認ダイアログ ──

  it("email-already-in-useエラーで確認ダイアログが表示される", async () => {
    mockVerifyBeforeUpdateEmail.mockRejectedValue({
      code: "auth/email-already-in-use",
    });

    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("メールアドレス");
    fireEvent.change(input, { target: { value: "existing@example.com" } });

    fireEvent.submit(screen.getByText("確認メールを送信").closest("form"));

    await waitFor(() => {
      expect(screen.getByText("はい・ログインし直す")).toBeInTheDocument();
    });
    expect(
      screen.getByText((t) => t.includes("既存ユーザーで登録済みです")),
    ).toBeInTheDocument();
  });

  it("確認ダイアログの「はい」でユーザー削除後ログインにリダイレクトされる", async () => {
    mockVerifyBeforeUpdateEmail.mockRejectedValue({
      code: "auth/email-already-in-use",
    });

    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("メールアドレス");
    fireEvent.change(input, { target: { value: "existing@example.com" } });

    fireEvent.submit(screen.getByText("確認メールを送信").closest("form"));

    await waitFor(() => {
      expect(screen.getByText("はい・ログインし直す")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("はい・ログインし直す"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("/login"),
      );
    });
  });

  it("確認ダイアログの「キャンセル」でダイアログが閉じる", async () => {
    mockVerifyBeforeUpdateEmail.mockRejectedValue({
      code: "auth/email-already-in-use",
    });

    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("メールアドレス");
    fireEvent.change(input, { target: { value: "existing@example.com" } });

    fireEvent.submit(screen.getByText("確認メールを送信").closest("form"));

    await waitFor(() => {
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("キャンセル"));

    await waitFor(() => {
      expect(
        screen.queryByText("はい・ログインし直す"),
      ).not.toBeInTheDocument();
    });
  });

  // ── requires-recent-login エラー ──

  it("requires-recent-loginエラーで再ログインにリダイレクトされる", async () => {
    mockVerifyBeforeUpdateEmail.mockRejectedValue({
      code: "auth/requires-recent-login",
    });

    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("メールアドレス");
    fireEvent.change(input, { target: { value: "new@example.com" } });

    fireEvent.submit(screen.getByText("確認メールを送信").closest("form"));

    await waitFor(() => {
      expect(
        screen.getByText((t) => t.includes("再ログインが必要です")),
      ).toBeInTheDocument();
    });
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("/login"));
  });

  // ── その他のエラー ──

  it("verifyBeforeUpdateEmailの一般エラーでメッセージが表示される", async () => {
    mockVerifyBeforeUpdateEmail.mockRejectedValue({
      code: "auth/unknown",
      message: "unknown error",
    });

    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("メールアドレス");
    fireEvent.change(input, { target: { value: "new@example.com" } });

    fireEvent.submit(screen.getByText("確認メールを送信").closest("form"));

    await waitFor(() => {
      expect(
        screen.getByText((t) => t.includes("メールの送信に失敗しました")),
      ).toBeInTheDocument();
    });
  });

  // ── redirect パラメータ付き ──

  // ── currentUserがnullの場合のsubmit ──

  it("currentUserがnull時にsubmitするとエラーメッセージが表示されリダイレクトされる", async () => {
    // currentUser を null にする
    const firebaseMock = require("@/shared/lib/firebase");
    const origUser = firebaseMock.auth.currentUser;
    firebaseMock.auth.currentUser = null;

    render(<RegisterEmailPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    // メール入力して送信
    const input = screen.getByLabelText("メールアドレス");
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.submit(screen.getByText("確認メールを送信").closest("form"));

    await waitFor(() => {
      expect(
        screen.getByText((t) => t.includes("認証情報を取得できませんでした")),
      ).toBeInTheDocument();
    });
    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("/login"));

    firebaseMock.auth.currentUser = origUser;
  });
});
