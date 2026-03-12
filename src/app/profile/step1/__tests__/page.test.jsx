/**
 * ProfileStep1 (app/profile/step1/page.jsx) の統合テスト
 *
 * ウェルカムページ: 認証ガード、登録済みリダイレクト、
 * 「はじめる」ボタンによる遷移を検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileStep1 from "@/app/profile/step1/page";

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

jest.mock("@/features/profile/components/FeatureCard", () => ({
  FeatureCard: ({ title }) => <div data-testid="feature-card">{title}</div>,
}));

jest.mock("@/features/profile/components/ArrowIcon", () => ({
  ArrowIcon: () => <span data-testid="arrow-icon">→</span>,
}));

const mockGet = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
  },
}));

/* ────────── テスト本体 ────────── */

describe("ProfileStep1", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });
    // メンバー未登録
    mockGet.mockRejectedValue({ response: { status: 404 } });
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<ProfileStep1 />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("登録済みユーザーは /menus にリダイレクトされる", async () => {
    mockGet.mockResolvedValue({ data: { username: "太郎" } });
    render(<ProfileStep1 />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/menus");
    });
  });

  // ── 初期表示 ──

  it("ウェルカムメッセージが表示される", () => {
    render(<ProfileStep1 />);
    expect(screen.getByText("FamDishへようこそ")).toBeInTheDocument();
  });

  it("プログレスバーが 1/7 で表示される", () => {
    render(<ProfileStep1 />);
    expect(screen.getByText("1/7")).toBeInTheDocument();
  });

  it("はじめるボタンが表示される", () => {
    render(<ProfileStep1 />);
    expect(screen.getByText("はじめる")).toBeInTheDocument();
  });

  // ── ナビゲーション ──

  it("はじめるボタンで /profile/step1-1 へ遷移する", () => {
    render(<ProfileStep1 />);
    fireEvent.click(screen.getByText("はじめる"));
    expect(mockPush).toHaveBeenCalledWith("/profile/step1-1");
  });
});
