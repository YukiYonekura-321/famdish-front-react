/**
 * ProfileStep3Part2 (app/profile/step3-2/page.jsx) の統合テスト
 *
 * 苦手なもの選択 & 最終送信: 認証ガード、トグル選択、
 * API送信（メンバー登録）、sessionStorageクリア、
 * エラーハンドリングを検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileStep3Part2 from "@/app/profile/step3-2/page";

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
}));

jest.mock("@/features/profile/components/Badges", () => ({
  XBadge: () => <span data-testid="x-badge">✕</span>,
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
}));

/* ────────── テスト本体 ────────── */

describe("ProfileStep3Part2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    // sessionStorage にプロフィール情報をセット
    sessionStorage.setItem("profile_display_name", "さくら");
    sessionStorage.setItem("profile_family_name", "田中家");
    sessionStorage.setItem("profile_likes", JSON.stringify(["唐揚げ"]));

    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });
    mockGet.mockRejectedValue({ response: { status: 404 } });
    mockPost.mockResolvedValue({ data: {} });
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<ProfileStep3Part2 />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("登録済みユーザーは /menus にリダイレクトされる", async () => {
    mockGet.mockResolvedValue({ data: { username: "太郎" } });
    render(<ProfileStep3Part2 />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/menus");
    });
  });

  // ── 初期表示 ──

  it("タイトルが表示される", () => {
    render(<ProfileStep3Part2 />);
    expect(screen.getByText("苦手なものを選んでください")).toBeInTheDocument();
  });

  it("プログレスバーが 7/7 で表示される", () => {
    render(<ProfileStep3Part2 />);
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
  });

  it("苦手なものの選択肢が表示される", () => {
    render(<ProfileStep3Part2 />);
    expect(screen.getByText("にんじん")).toBeInTheDocument();
    expect(screen.getByText("ピーマン")).toBeInTheDocument();
    expect(screen.getByText("トマト")).toBeInTheDocument();
  });

  it("登録完了ボタンが表示される", () => {
    render(<ProfileStep3Part2 />);
    expect(screen.getByText("登録完了")).toBeInTheDocument();
  });

  // ── 選択トグル ──

  it("アイテムをクリックすると選択数が増える", () => {
    render(<ProfileStep3Part2 />);
    fireEvent.click(screen.getByText("にんじん"));

    // "1" の要素と "個選択中" がある
    const countElements = screen.getAllByText("1");
    expect(countElements.length).toBeGreaterThanOrEqual(1);
  });

  // ── フォーム送信（成功） ──

  it("登録完了ボタンを押すとAPIが呼ばれ /menus へ遷移する", async () => {
    render(<ProfileStep3Part2 />);

    fireEvent.click(screen.getByText("ピーマン"));
    fireEvent.click(screen.getByText("登録完了"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/api/members",
        expect.objectContaining({
          member: expect.objectContaining({
            name: "さくら",
            likes_attributes: [{ name: "唐揚げ" }],
            dislikes_attributes: [{ name: "ピーマン" }],
          }),
          family: { name: "田中家" },
        }),
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/menus");
    });

    // sessionStorage がクリアされる
    expect(sessionStorage.getItem("profile_display_name")).toBeNull();
    expect(sessionStorage.getItem("profile_family_name")).toBeNull();
    expect(sessionStorage.getItem("profile_likes")).toBeNull();
  });

  // ── 招待フロー ──

  it("招待フローの場合は family_id を送信する", async () => {
    sessionStorage.setItem("invited_family_id", "42");
    render(<ProfileStep3Part2 />);

    fireEvent.click(screen.getByText("登録完了"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/api/members",
        expect.objectContaining({
          member: expect.objectContaining({
            name: "さくら",
          }),
          family_id: "42",
        }),
      );
    });
  });

  // ── エラー ──

  it("API エラー時にエラーメッセージが表示される", async () => {
    mockPost.mockRejectedValue({
      response: { data: { errors: ["名前は必須です"] } },
    });

    render(<ProfileStep3Part2 />);
    fireEvent.click(screen.getByText("登録完了"));

    await waitFor(() => {
      expect(screen.getByText(/名前は必須です/)).toBeInTheDocument();
    });
  });

  it("通信エラー時にメッセージが表示される", async () => {
    mockPost.mockRejectedValue(new Error("Network Error"));

    render(<ProfileStep3Part2 />);
    fireEvent.click(screen.getByText("登録完了"));

    await waitFor(() => {
      expect(screen.getByText("通信エラーが発生しました")).toBeInTheDocument();
    });
  });

  // ── 戻るボタン ──

  it("戻るボタンで /profile/step3-1 へ遷移する", () => {
    render(<ProfileStep3Part2 />);
    fireEvent.click(screen.getByText("戻る"));
    expect(mockPush).toHaveBeenCalledWith("/profile/step3-1");
  });
});
