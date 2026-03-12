/**
 * ProfileStep3 (app/profile/step3/page.jsx) の統合テスト
 *
 * 好み入力導入ページ: 認証ガード、登録済みリダイレクト、
 * 「始める」「戻る」ボタンによる遷移を検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileStep3 from "@/app/profile/step3/page";

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

describe("ProfileStep3", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    render(<ProfileStep3 />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("登録済みユーザーは /menus にリダイレクトされる", async () => {
    mockGet.mockResolvedValue({ data: { username: "太郎" } });
    render(<ProfileStep3 />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/menus");
    });
  });

  // ── 初期表示 ──

  it("好み入力タイトルが表示される", () => {
    render(<ProfileStep3 />);
    expect(screen.getByText("好みを教えてください")).toBeInTheDocument();
  });

  it("プログレスバーが 5/7 で表示される", () => {
    render(<ProfileStep3 />);
    expect(screen.getByText("5/7")).toBeInTheDocument();
  });

  // ── ナビゲーション ──

  it("始めるボタンで /profile/step3-1 へ遷移する", () => {
    render(<ProfileStep3 />);
    fireEvent.click(screen.getByText("始める"));
    expect(mockPush).toHaveBeenCalledWith("/profile/step3-1");
  });

  it("戻るボタンで /profile/step2 へ遷移する", () => {
    render(<ProfileStep3 />);
    fireEvent.click(screen.getByText("戻る"));
    expect(mockPush).toHaveBeenCalledWith("/profile/step2");
  });
});
