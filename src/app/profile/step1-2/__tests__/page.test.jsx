/**
 * ProfileStep1Part2 (app/profile/step1-2/page.jsx) の統合テスト
 *
 * 通知メール設定: 認証ガード、メール更新、
 * opt-out チェックボックス、前後ナビゲーションを検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileStep1Part2 from "@/app/profile/step1-2/page";

/* ────────── モック設定 ────────── */

const mockOnAuthStateChanged = jest.fn();
const mockVerifyBeforeUpdateEmail = jest.fn();
const mockReauthenticateWithPopup = jest.fn();

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  verifyBeforeUpdateEmail: (...args) => mockVerifyBeforeUpdateEmail(...args),
  reauthenticateWithPopup: (...args) => mockReauthenticateWithPopup(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { currentUser: { email: "test@example.com", uid: "test-uid" } },
}));

jest.mock("@/features/auth/lib/provider-utils", () => ({
  getProvider: () => ({ providerId: "google.com" }),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("@/features/profile/components/ProgressBar", () => ({
  ProgressBar: ({ current, total }) => (
    <div data-testid="progress-bar">
      {current}/{total}
    </div>
  ),
}));

jest.mock("@/features/profile/components/ProfileNavArrows", () => ({
  BackArrow: () => <span>←</span>,
  ForwardArrow: () => <span>→</span>,
}));

const mockGet = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
  },
}));

/* ────────── テスト本体 ────────── */

describe("ProfileStep1Part2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid", email: "test@example.com" });
      return jest.fn();
    });
    mockGet.mockRejectedValue({ response: { status: 404 } });
    mockReauthenticateWithPopup.mockResolvedValue();
    mockVerifyBeforeUpdateEmail.mockResolvedValue();
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
    render(<ProfileStep1Part2 />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("登録済みユーザーは /menus にリダイレクトされる", async () => {
    mockGet.mockResolvedValue({ data: { username: "太郎" } });
    render(<ProfileStep1Part2 />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/menus");
    });
  });

  // ── 初期表示 ──

  it("通知メール設定タイトルが表示される", () => {
    render(<ProfileStep1Part2 />);
    expect(screen.getByText("通知メールの設定")).toBeInTheDocument();
  });

  it("プログレスバーが 3/7 で表示される", () => {
    render(<ProfileStep1Part2 />);
    expect(screen.getByText("3/7")).toBeInTheDocument();
  });

  it("メールアドレス入力欄がある", () => {
    render(<ProfileStep1Part2 />);
    expect(
      screen.getByPlaceholderText("example@domain.com"),
    ).toBeInTheDocument();
  });

  // ── opt-out ──

  it("通知を受け取らないチェックボックスがある", () => {
    render(<ProfileStep1Part2 />);
    expect(screen.getByText("通知を受け取らない")).toBeInTheDocument();
  });

  it("opt-outを選んで送信すると /profile/step2 へ遷移する", () => {
    render(<ProfileStep1Part2 />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    fireEvent.submit(
      screen.getByPlaceholderText("example@domain.com").closest("form"),
    );
    expect(mockPush).toHaveBeenCalledWith("/profile/step2");
  });

  // ── 戻るボタン ──

  it("戻るボタンで /profile/step1-1 へ遷移する", () => {
    render(<ProfileStep1Part2 />);
    fireEvent.click(screen.getByText("戻る"));
    expect(mockPush).toHaveBeenCalledWith("/profile/step1-1");
  });

  // ── 同じメールで送信 ──

  it("同じメールアドレスで送信すると /profile/step2 へ遷移する", async () => {
    render(<ProfileStep1Part2 />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("example@domain.com"),
      ).toBeInTheDocument();
    });

    // メールアドレスを変えずにsubmit
    fireEvent.submit(
      screen.getByPlaceholderText("example@domain.com").closest("form"),
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/profile/step2");
    });
  });
});
