/**
 * SocialPage (app/mypage/social/page.jsx) の統合テスト
 */
import { render, screen } from "@testing-library/react";
import SocialPage from "@/app/mypage/social/page";

const mockOnAuthStateChanged = jest.fn();

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: {},
}));

const mockReplace = jest.fn();
const mockRouter = { push: jest.fn(), replace: mockReplace };
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/mypage/social",
}));

jest.mock("@/shared/components/auth_header", () => ({
  AuthHeader: () => <header data-testid="auth-header">AuthHeader</header>,
}));

jest.mock("@/shared/lib/api", () => ({
  apiClient: { get: jest.fn().mockResolvedValue({ data: {} }) },
}));

jest.mock("@/features/auth/components/ProviderLinkTable", () => ({
  ProviderLinkTable: ({ user }) => (
    <div data-testid="provider-link-table">ProviderLinkTable: {user?.uid}</div>
  ),
}));

describe("SocialPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("「連携状態」見出しを表示する", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });

    render(<SocialPage />);
    expect(screen.getByText(/連携状態/)).toBeInTheDocument();
  });

  it("認証済みのとき ProviderLinkTable をレンダリングする", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });

    render(<SocialPage />);
    expect(screen.getByTestId("provider-link-table")).toBeInTheDocument();
  });

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb(null);
      return jest.fn();
    });

    render(<SocialPage />);

    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("AuthHeader がレンダリングされている", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });

    render(<SocialPage />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });
});
