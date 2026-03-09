/**
 * WithdrawPage (app/mypage/withdraw/page.jsx) の統合テスト
 */
import { render, screen, fireEvent } from "@testing-library/react";
import WithdrawPage from "@/app/mypage/withdraw/page";

const mockOnAuthStateChanged = jest.fn();
const mockDeleteUser = jest.fn();

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: {},
}));

jest.mock("@/features/auth/lib/delete-user", () => ({
  deleteUser: () => mockDeleteUser(),
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  usePathname: () => "/mypage/withdraw",
}));

jest.mock("@/shared/components/auth_header", () => ({
  AuthHeader: () => <header data-testid="auth-header">AuthHeader</header>,
}));

jest.mock("@/shared/lib/api", () => ({
  apiClient: { get: jest.fn().mockResolvedValue({ data: {} }) },
}));

describe("WithdrawPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid" }); // 認証済み
      return jest.fn();
    });
  });

  it("「退会」見出しを表示する", () => {
    render(<WithdrawPage />);
    expect(screen.getByRole("heading", { name: /退会/ })).toBeInTheDocument();
  });

  it("退会の注意メッセージを表示する", () => {
    render(<WithdrawPage />);
    expect(screen.getByText(/この操作は取り消せません/)).toBeInTheDocument();
  });

  it("「退会する」ボタンをクリックすると deleteUser が呼ばれる", () => {
    render(<WithdrawPage />);
    fireEvent.click(screen.getByText("退会する"));
    expect(mockDeleteUser).toHaveBeenCalled();
  });

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb(null);
      return jest.fn();
    });

    render(<WithdrawPage />);

    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("AuthHeader がレンダリングされている", () => {
    render(<WithdrawPage />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });
});
