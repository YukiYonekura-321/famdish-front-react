/**
 * ProfileStep2 (app/profile/step2/page.jsx) の統合テスト
 *
 * 家族名入力フォーム: 認証ガード、招待フローのスキップ、
 * 入力・送信、sessionStorage保存を検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileStep2 from "@/app/profile/step2/page";

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

describe("ProfileStep2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });
    mockGet.mockRejectedValue({ response: { status: 404 } });
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<ProfileStep2 />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("登録済みユーザーは /menus にリダイレクトされる", async () => {
    mockGet.mockResolvedValue({ data: { username: "太郎" } });
    render(<ProfileStep2 />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/menus");
    });
  });

  // ── 招待フロー ──

  it("招待フローの場合は /profile/step3 へスキップする", () => {
    sessionStorage.setItem("from_invitation", "true");
    sessionStorage.setItem("invited_family_name", "田中家");
    render(<ProfileStep2 />);
    expect(mockReplace).toHaveBeenCalledWith("/profile/step3");
    expect(sessionStorage.getItem("profile_family_name")).toBe("田中家");
  });

  // ── 初期表示 ──

  it("家族名入力タイトルが表示される", () => {
    render(<ProfileStep2 />);
    expect(screen.getByText("家族名を決めましょう")).toBeInTheDocument();
  });

  it("プログレスバーが 4/7 で表示される", () => {
    render(<ProfileStep2 />);
    expect(screen.getByText("4/7")).toBeInTheDocument();
  });

  it("家族名入力欄がある", () => {
    render(<ProfileStep2 />);
    expect(screen.getByPlaceholderText("例: 田中家")).toBeInTheDocument();
  });

  // ── フォーム送信 ──

  it("家族名を入力して送信すると sessionStorage に保存され /profile/step3 へ遷移する", () => {
    render(<ProfileStep2 />);
    const input = screen.getByPlaceholderText("例: 田中家");
    fireEvent.change(input, { target: { value: "鈴木家" } });
    fireEvent.submit(input.closest("form"));

    expect(sessionStorage.getItem("profile_family_name")).toBe("鈴木家");
    expect(mockPush).toHaveBeenCalledWith("/profile/step3");
  });

  // ── 戻るボタン ──

  it("戻るボタンで /profile/step1-2 へ遷移する", () => {
    render(<ProfileStep2 />);
    fireEvent.click(screen.getByText("戻る"));
    expect(mockPush).toHaveBeenCalledWith("/profile/step1-2");
  });
});
