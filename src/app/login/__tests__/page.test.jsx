/**
 * LoginPage (app/login/page.jsx) の統合テスト
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";

// firebase/auth モック
const mockSignInWithPopup = jest.fn();
const mockGetAdditionalUserInfo = jest.fn();

jest.mock("firebase/auth", () => ({
  GoogleAuthProvider: jest.fn(() => ({ providerId: "google.com" })),
  TwitterAuthProvider: jest.fn(() => ({ providerId: "twitter.com" })),
  GithubAuthProvider: jest.fn(() => ({ providerId: "github.com" })),
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  getAdditionalUserInfo: (...args) => mockGetAdditionalUserInfo(...args),
  onAuthStateChanged: jest.fn(() => jest.fn()),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { currentUser: null },
}));

jest.mock("@/shared/lib/api", () => ({
  apiClient: { get: jest.fn() },
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
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

jest.mock("@/features/auth/lib/redirect-utils", () => ({
  isValidRedirectPath: jest.fn((path) => path && path.startsWith("/")),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState = jest.fn();
  });

  it("「ログイン」見出しを表示する", () => {
    render(<LoginPage />);
    expect(screen.getByText("ログイン")).toBeInTheDocument();
  });

  it("3 つのソーシャルログインボタンを表示する", () => {
    render(<LoginPage />);
    expect(screen.getByText("Googleでログイン")).toBeInTheDocument();
    expect(screen.getByText("X(Twitter)でログイン")).toBeInTheDocument();
    expect(screen.getByText("Githubでログイン")).toBeInTheDocument();
  });

  it("「ソーシャルログインできない場合はこちら」リンクが /recovery へ", () => {
    render(<LoginPage />);
    const link = screen.getByText("ソーシャルログインできない場合はこちら");
    expect(link).toHaveAttribute("href", "/recovery");
  });

  it("「会員登録はこちら」リンクが /sign-in へ", () => {
    render(<LoginPage />);
    const link = screen.getByText("会員登録はこちら");
    expect(link).toHaveAttribute("href", "/sign-in");
  });

  it("Google ログインボタンクリックで signInWithPopup が呼ばれる", async () => {
    mockSignInWithPopup.mockResolvedValue({
      user: { emailVerified: true },
    });
    mockGetAdditionalUserInfo.mockReturnValue({ isNewUser: false });

    const { apiClient } = require("@/shared/lib/api");
    apiClient.get.mockResolvedValue({ data: { username: "taro" } });

    render(<LoginPage />);
    fireEvent.click(screen.getByText("Googleでログイン"));

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled();
    });
  });

  it("新規ユーザーの場合 /profile/step1 へリダイレクト", async () => {
    mockSignInWithPopup.mockResolvedValue({
      user: { emailVerified: true },
    });
    mockGetAdditionalUserInfo.mockReturnValue({ isNewUser: true });

    render(<LoginPage />);
    fireEvent.click(screen.getByText("Googleでログイン"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/profile/step1");
    });
  });

  it("emailVerified=true のクエリパラメータでアラートが表示される", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    // URLSearchParams をモックして emailVerified=true を返す
    const OriginalURLSearchParams = global.URLSearchParams;
    global.URLSearchParams = class extends OriginalURLSearchParams {
      constructor() {
        super("?emailVerified=true");
      }
    };

    render(<LoginPage />);

    expect(alertSpy).toHaveBeenCalledWith(
      "メールアドレスの確認ができたので、もう一度ログインしてください",
    );
    global.URLSearchParams = OriginalURLSearchParams;
    alertSpy.mockRestore();
  });
});
