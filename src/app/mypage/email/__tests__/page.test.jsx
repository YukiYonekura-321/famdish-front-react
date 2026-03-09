/**
 * EmailChangePage (app/mypage/email/page.jsx) の統合テスト
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmailChangePage from "@/app/mypage/email/page";

const mockOnAuthStateChanged = jest.fn();
const mockVerifyBeforeUpdateEmail = jest.fn();
const mockReauthenticateWithPopup = jest.fn();

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  verifyBeforeUpdateEmail: (...args) => mockVerifyBeforeUpdateEmail(...args),
  reauthenticateWithPopup: (...args) => mockReauthenticateWithPopup(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { currentUser: null, language: null },
}));

jest.mock("@/features/auth/lib/provider-utils", () => ({
  getProvider: jest.fn(() => ({ providerId: "google.com" })),
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  usePathname: () => "/mypage/email",
}));

jest.mock("@/shared/components/auth_header", () => ({
  AuthHeader: () => <header data-testid="auth-header">AuthHeader</header>,
}));

jest.mock("@/shared/lib/api", () => ({
  apiClient: { get: jest.fn().mockResolvedValue({ data: {} }) },
}));

describe("EmailChangePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("「メールアドレス変更」見出しを表示する", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid", email: "old@example.com" });
      return jest.fn();
    });

    render(<EmailChangePage />);
    expect(screen.getByText("メールアドレス変更")).toBeInTheDocument();
  });

  it("現在のメールアドレスを表示する", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid", email: "old@example.com" });
      return jest.fn();
    });

    render(<EmailChangePage />);
    expect(screen.getByText("old@example.com")).toBeInTheDocument();
  });

  it("未認証ユーザーは /login にリダイレクト", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb(null);
      return jest.fn();
    });

    render(<EmailChangePage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("「変更」ボタンがある", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid", email: "old@example.com" });
      return jest.fn();
    });

    render(<EmailChangePage />);
    expect(screen.getByRole("button", { name: "変更" })).toBeInTheDocument();
  });

  it("新しいメールアドレスの入力欄がある", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid", email: "old@example.com" });
      return jest.fn();
    });

    render(<EmailChangePage />);
    expect(
      screen.getByPlaceholderText("example@email.com"),
    ).toBeInTheDocument();
  });
});
