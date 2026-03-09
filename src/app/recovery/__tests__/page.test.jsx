/**
 * RecoveryPage (app/recovery/page.jsx) の統合テスト
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecoveryPage from "@/app/recovery/page";

const mockFetchSignInMethodsForEmail = jest.fn();
const mockSendSignInLinkToEmail = jest.fn();
const mockOnAuthStateChanged = jest.fn((auth, cb) => jest.fn());

jest.mock("firebase/auth", () => ({
  fetchSignInMethodsForEmail: (...args) =>
    mockFetchSignInMethodsForEmail(...args),
  sendSignInLinkToEmail: (...args) => mockSendSignInLinkToEmail(...args),
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { languageCode: null },
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
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

describe("RecoveryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("「アカウントの回復」見出しを表示する", () => {
    render(<RecoveryPage />);
    expect(screen.getByText("アカウントの回復")).toBeInTheDocument();
  });

  it("メールアドレス入力欄がある", () => {
    render(<RecoveryPage />);
    expect(
      screen.getByPlaceholderText("example@email.com"),
    ).toBeInTheDocument();
  });

  it("「ログイン用URLを送信」ボタンがある", () => {
    render(<RecoveryPage />);
    expect(
      screen.getByRole("button", { name: "ログイン用URLを送信" }),
    ).toBeInTheDocument();
  });

  it("「ログインページに戻る」リンクがある", () => {
    render(<RecoveryPage />);
    expect(screen.getByText("ログインページに戻る")).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("送信成功後にメッセージを表示する", async () => {
    mockFetchSignInMethodsForEmail.mockResolvedValue(["google.com"]);
    mockSendSignInLinkToEmail.mockResolvedValue();

    render(<RecoveryPage />);

    fireEvent.change(screen.getByPlaceholderText("example@email.com"), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "ログイン用URLを送信" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/登録済みである場合、ログイン用のURLが送られています/),
      ).toBeInTheDocument();
    });
  });

  it("送信失敗時にエラーメッセージを表示する", async () => {
    mockFetchSignInMethodsForEmail.mockRejectedValue(
      new Error("auth/invalid-email"),
    );

    render(<RecoveryPage />);

    fireEvent.change(screen.getByPlaceholderText("example@email.com"), {
      target: { value: "bad@email.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "ログイン用URLを送信" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/ログイン用URLの送信に失敗しました/),
      ).toBeInTheDocument();
    });
  });

  it("認証済みユーザーが来ると /menus にリダイレクト", () => {
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });

    render(<RecoveryPage />);

    expect(mockReplace).toHaveBeenCalledWith("/menus");
  });
});
