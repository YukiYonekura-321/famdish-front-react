/**
 * SignInPage (app/sign-in/page.jsx) の統合テスト
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignInPage from "@/app/sign-in/page";

const mockSignInWithPopup = jest.fn();
const mockGetAdditionalUserInfo = jest.fn();
const mockOnAuthStateChanged = jest.fn((auth, cb) => {
  // デフォルトは未認証
  return jest.fn();
});

jest.mock("firebase/auth", () => ({
  GoogleAuthProvider: jest.fn(() => ({ providerId: "google.com" })),
  TwitterAuthProvider: jest.fn(() => ({ providerId: "twitter.com" })),
  GithubAuthProvider: jest.fn(() => ({ providerId: "github.com" })),
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  getAdditionalUserInfo: (...args) => mockGetAdditionalUserInfo(...args),
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { currentUser: null },
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  usePathname: () => "/sign-in",
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

jest.mock("@/shared/components/header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

describe("SignInPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("「会員登録」見出しを表示する", () => {
    render(<SignInPage />);
    expect(screen.getByText("会員登録")).toBeInTheDocument();
  });

  it("3 つのソーシャル登録ボタンを表示する", () => {
    render(<SignInPage />);
    expect(screen.getByText("Googleで新規登録")).toBeInTheDocument();
    expect(screen.getByText("X(Twitter)で新規登録")).toBeInTheDocument();
    expect(screen.getByText("Githubで新規登録")).toBeInTheDocument();
  });

  it("「ログインはこちら」リンクが /login に向いている", () => {
    render(<SignInPage />);
    const link = screen.getByText("ログインはこちら");
    expect(link).toHaveAttribute("href", "/login");
  });

  it("Google 新規登録ボタンクリックで signInWithPopup が呼ばれる", async () => {
    mockSignInWithPopup.mockResolvedValue({
      user: { emailVerified: true },
    });
    mockGetAdditionalUserInfo.mockReturnValue({ isNewUser: true });

    render(<SignInPage />);
    fireEvent.click(screen.getByText("Googleで新規登録"));

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled();
    });
  });

  it("新規ユーザーの場合 /profile/step1 へリダイレクト", async () => {
    mockSignInWithPopup.mockResolvedValue({
      user: { emailVerified: true },
    });
    mockGetAdditionalUserInfo.mockReturnValue({ isNewUser: true });

    render(<SignInPage />);
    fireEvent.click(screen.getByText("Googleで新規登録"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/profile/step1");
    });
  });

  it("メール未認証の場合 /register-email へリダイレクト", async () => {
    mockSignInWithPopup.mockResolvedValue({
      user: { emailVerified: false },
    });
    mockGetAdditionalUserInfo.mockReturnValue({ isNewUser: true });

    render(<SignInPage />);
    fireEvent.click(screen.getByText("Googleで新規登録"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/register-email");
    });
  });

  it("認証済みユーザーが来ると onAuthStateChanged で /menus にリダイレクト", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid" }); // 認証済みユーザー
      return jest.fn();
    });

    render(<SignInPage />);

    expect(mockReplace).toHaveBeenCalledWith("/menus");
  });

  it("ログインエラー時にエラーメッセージを表示する", async () => {
    mockSignInWithPopup.mockRejectedValue({
      code: "auth/popup-closed-by-user",
      message: "popup closed",
    });

    render(<SignInPage />);
    fireEvent.click(screen.getByText("Googleで新規登録"));

    await waitFor(() => {
      expect(
        screen.getByText(/ログイン\/新規登録に失敗しました/),
      ).toBeInTheDocument();
    });
  });
});
