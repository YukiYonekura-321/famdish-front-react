/**
 * ProfileStep3Part1 (app/profile/step3-1/page.jsx) の統合テスト
 *
 * 好きなもの選択: 認証ガード、トグル選択、
 * sessionStorage保存、前後ナビゲーションを検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileStep3Part1 from "@/app/profile/step3-1/page";

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

jest.mock("@/features/profile/components/Badges", () => ({
  CheckBadge: () => <span data-testid="check-badge">✓</span>,
}));

const mockGet = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
  },
}));

/* ────────── テスト本体 ────────── */

describe("ProfileStep3Part1", () => {
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
    render(<ProfileStep3Part1 />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("登録済みユーザーは /menus にリダイレクトされる", async () => {
    mockGet.mockResolvedValue({ data: { username: "太郎" } });
    render(<ProfileStep3Part1 />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/menus");
    });
  });

  // ── 初期表示 ──

  it("タイトルが表示される", () => {
    render(<ProfileStep3Part1 />);
    expect(screen.getByText("好きなものを選んでください")).toBeInTheDocument();
  });

  it("プログレスバーが 6/7 で表示される", () => {
    render(<ProfileStep3Part1 />);
    expect(screen.getByText("6/7")).toBeInTheDocument();
  });

  it("好きなものの選択肢が表示される", () => {
    render(<ProfileStep3Part1 />);
    expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    expect(screen.getByText("カレーライス")).toBeInTheDocument();
    expect(screen.getByText("ラーメン")).toBeInTheDocument();
  });

  it("初期状態で 0個選択中 と表示される", () => {
    render(<ProfileStep3Part1 />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("個選択中")).toBeInTheDocument();
  });

  // ── 選択トグル ──

  it("アイテムをクリックすると選択数が増える", () => {
    render(<ProfileStep3Part1 />);
    fireEvent.click(screen.getByText("唐揚げ"));
    expect(screen.getByText("1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("カレーライス"));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("選択済みアイテムを再度クリックすると選択解除される", () => {
    render(<ProfileStep3Part1 />);
    fireEvent.click(screen.getByText("唐揚げ"));
    expect(screen.getByText("1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("唐揚げ"));
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  // ── フォーム送信 ──

  it("送信すると sessionStorage に保存され /profile/step3-2 へ遷移する", () => {
    render(<ProfileStep3Part1 />);
    fireEvent.click(screen.getByText("唐揚げ"));
    fireEvent.click(screen.getByText("ラーメン"));
    fireEvent.click(screen.getByText("次へ"));

    const saved = JSON.parse(sessionStorage.getItem("profile_likes"));
    expect(saved).toEqual(["唐揚げ", "ラーメン"]);
    expect(mockPush).toHaveBeenCalledWith("/profile/step3-2");
  });

  // ── 戻るボタン ──

  it("戻るボタンで /profile/step3 へ遷移する", () => {
    render(<ProfileStep3Part1 />);
    fireEvent.click(screen.getByText("戻る"));
    expect(mockPush).toHaveBeenCalledWith("/profile/step3");
  });
});
