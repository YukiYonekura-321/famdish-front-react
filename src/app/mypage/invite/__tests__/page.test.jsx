/**
 * InviteMemberPage (app/mypage/invite/page.jsx) の統合テスト
 *
 * ログイン不要メンバー（子供など）の追加フォーム。
 * 名前・好き嫌い入力 → POST /api/members でメンバー作成を検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InviteMemberPage from "@/app/mypage/invite/page";

/* ────────── モック設定 ────────── */

const mockOnAuthStateChanged = jest.fn();
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: {},
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => "/mypage/invite",
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

jest.mock("@/shared/components/auth_header", () => ({
  AuthHeader: () => <header data-testid="auth-header">AuthHeader</header>,
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
}));

// TagInputList はシンプルなモックで代替
jest.mock("@/features/member/components/TagInputList", () => ({
  TagInputList: ({ label, items, onChange, placeholder }) => (
    <div data-testid={`tag-input-${label}`}>
      <label>{label}</label>
      <input
        placeholder={placeholder}
        data-testid={`tag-input-field-${label}`}
        onChange={(e) => onChange([e.target.value])}
      />
    </div>
  ),
}));

jest.mock("@/features/member/constants", () => ({
  LIKE_CANDIDATES: ["カレー", "ラーメン"],
  DISLIKE_CANDIDATES: ["ピーマン", "セロリ"],
}));

/* ────────── テスト本体 ────────── */

describe("InviteMemberPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });
    mockGet.mockResolvedValue({ data: { family_id: "fam-123" } });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<InviteMemberPage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  // ── 初期表示 ──

  it("ページ見出し「家族メンバーを追加」を表示する", () => {
    render(<InviteMemberPage />);
    expect(screen.getByText(/家族メンバーを追加/)).toBeInTheDocument();
  });

  it("AuthHeader がレンダリングされている", () => {
    render(<InviteMemberPage />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });

  it("名前入力欄がある", () => {
    render(<InviteMemberPage />);
    expect(screen.getByPlaceholderText("例：たろう")).toBeInTheDocument();
  });

  it("好きなもの・嫌いなものの入力欄がある", () => {
    render(<InviteMemberPage />);
    expect(screen.getByTestId("tag-input-好きなもの")).toBeInTheDocument();
    expect(screen.getByTestId("tag-input-嫌いなもの")).toBeInTheDocument();
  });

  it("送信ボタンがある", () => {
    render(<InviteMemberPage />);
    expect(
      screen.getByRole("button", { name: "この内容で登録する" }),
    ).toBeInTheDocument();
  });

  // ── バリデーション ──

  it("名前が空のとき「名前を入力してください」を表示する", async () => {
    render(<InviteMemberPage />);

    fireEvent.click(screen.getByRole("button", { name: "この内容で登録する" }));

    await waitFor(() => {
      expect(screen.getByText("名前を入力してください")).toBeInTheDocument();
    });
    expect(mockPost).not.toHaveBeenCalled();
  });

  // ── 送信成功 ──

  it("送信成功時にメンバー作成APIが呼ばれ、成功メッセージが表示される", async () => {
    mockPost.mockResolvedValue({ data: { name: "たろう" } });

    render(<InviteMemberPage />);

    // 名前入力
    fireEvent.change(screen.getByPlaceholderText("例：たろう"), {
      target: { value: "たろう" },
    });

    // 送信
    fireEvent.click(screen.getByRole("button", { name: "この内容で登録する" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/api/members",
        expect.objectContaining({
          member: expect.objectContaining({
            name: "たろう",
          }),
          link_user: false,
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/たろうさんを登録しました/)).toBeInTheDocument();
    });
  });

  // ── 送信失敗 ──

  it("送信失敗時にエラーメッセージを表示する", async () => {
    mockPost.mockRejectedValue({
      response: { data: { errors: ["名前は既に使用されています"] } },
    });

    render(<InviteMemberPage />);

    fireEvent.change(screen.getByPlaceholderText("例：たろう"), {
      target: { value: "たろう" },
    });
    fireEvent.click(screen.getByRole("button", { name: "この内容で登録する" }));

    await waitFor(() => {
      expect(
        screen.getByText(/名前は既に使用されています/),
      ).toBeInTheDocument();
    });
  });

  it("ネットワークエラー時にエラーメッセージを表示する", async () => {
    mockPost.mockRejectedValue(new Error("Network Error"));

    render(<InviteMemberPage />);

    fireEvent.change(screen.getByPlaceholderText("例：たろう"), {
      target: { value: "たろう" },
    });
    fireEvent.click(screen.getByRole("button", { name: "この内容で登録する" }));

    await waitFor(() => {
      expect(screen.getByText(/通信エラーが発生しました/)).toBeInTheDocument();
    });
  });

  // ── ナビゲーション ──

  it("メンバー一覧に戻るリンクがある", () => {
    render(<InviteMemberPage />);
    const link = screen.getByText("← メンバー一覧に戻る").closest("a");
    expect(link).toHaveAttribute("href", "/members/index");
  });
});
