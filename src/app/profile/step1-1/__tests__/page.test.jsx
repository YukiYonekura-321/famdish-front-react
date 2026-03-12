/**
 * ProfileStep1Part1 (app/profile/step1-1/page.jsx) の統合テスト
 *
 * 表示名入力フォーム: 認証ガード、入力・送信、
 * sessionStorage保存、前後ナビゲーションを検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileStep1Part1 from "@/app/profile/step1-1/page";

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

describe("ProfileStep1Part1", () => {
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
    render(<ProfileStep1Part1 />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("登録済みユーザーは /menus にリダイレクトされる", async () => {
    mockGet.mockResolvedValue({ data: { username: "太郎" } });
    render(<ProfileStep1Part1 />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/menus");
    });
  });

  // ── 初期表示 ──

  it("表示名設定タイトルが表示される", () => {
    render(<ProfileStep1Part1 />);
    expect(screen.getByText("表示名を設定してください")).toBeInTheDocument();
  });

  it("プログレスバーが 2/7 で表示される", () => {
    render(<ProfileStep1Part1 />);
    expect(screen.getByText("2/7")).toBeInTheDocument();
  });

  it("表示名入力欄がある", () => {
    render(<ProfileStep1Part1 />);
    expect(screen.getByPlaceholderText("例: さくら")).toBeInTheDocument();
  });

  // ── フォーム送信 ──

  it("表示名を入力して送信すると sessionStorage に保存され /profile/step1-2 へ遷移する", () => {
    render(<ProfileStep1Part1 />);
    const input = screen.getByPlaceholderText("例: さくら");
    fireEvent.change(input, { target: { value: "さくら" } });
    fireEvent.submit(input.closest("form"));

    expect(sessionStorage.getItem("profile_display_name")).toBe("さくら");
    expect(mockPush).toHaveBeenCalledWith("/profile/step1-2");
  });

  // ── 戻るボタン ──

  it("戻るボタンで /profile/step1 へ遷移する", () => {
    render(<ProfileStep1Part1 />);
    fireEvent.click(screen.getByText("戻る"));
    expect(mockPush).toHaveBeenCalledWith("/profile/step1");
  });
});
