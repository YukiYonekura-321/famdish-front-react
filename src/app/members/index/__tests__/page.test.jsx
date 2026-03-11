/**
 * MemberForm (app/members/index/page.jsx) の統合テスト
 *
 * メンバー一覧表示、編集（好き嫌い変更）、削除、
 * 権限チェック（checkOwnership）、認証ガードを検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MemberForm from "@/app/members/index/page";

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
  usePathname: () => "/members/index",
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
const mockPut = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    put: (...args) => mockPut(...args),
    delete: (...args) => mockDelete(...args),
  },
}));

// checkOwnership と buildNestedAttrs は実物を使う
jest.mock("@/features/member/components/EditableList", () => ({
  EditableList: ({ label, items, setItems }) => (
    <div data-testid={`editable-list-${label}`}>
      <span>{label}</span>
      {items.map((item, i) => (
        <span key={i}>{typeof item === "string" ? item : item.name}</span>
      ))}
    </div>
  ),
}));

jest.mock("@/features/member/components/BadgeList", () => ({
  BadgeList: ({ items, emptyText }) => (
    <div data-testid="badge-list">
      {items && items.length > 0 ? (
        items.map((item, i) => <span key={i}>{item.name}</span>)
      ) : (
        <span>{emptyText}</span>
      )}
    </div>
  ),
}));

jest.mock("@/features/member/components/MenuList", () => ({
  MenuList: ({ member }) => (
    <div data-testid={`menu-list-${member.id}`}>MenuList</div>
  ),
}));

/* ────────── テストデータ ────────── */

const MEMBERS = [
  {
    id: 1,
    name: "太郎",
    uid: "test-uid",
    likes: [{ id: 1, name: "カレー" }],
    dislikes: [{ id: 2, name: "ピーマン" }],
    menus: [],
  },
  {
    id: 2,
    name: "花子",
    uid: "other-uid",
    likes: [{ id: 3, name: "寿司" }],
    dislikes: [],
    menus: [],
  },
];

/* ────────── テスト本体 ────────── */

describe("MemberForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });
    mockGet.mockResolvedValue({ data: MEMBERS });
    // window.confirm / window.alert のモック
    jest.spyOn(window, "confirm").mockReturnValue(true);
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    window.confirm.mockRestore?.();
    window.alert.mockRestore?.();
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<MemberForm />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  // ── 初期表示 ──

  it("ページ見出し「メンバー情報」を表示する", async () => {
    render(<MemberForm />);
    expect(screen.getByText("メンバー情報")).toBeInTheDocument();
  });

  it("AuthHeader がレンダリングされている", () => {
    render(<MemberForm />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });

  it("メンバー一覧が表示される", async () => {
    render(<MemberForm />);
    await waitFor(() => {
      expect(screen.getByText("太郎")).toBeInTheDocument();
    });
    expect(screen.getByText("花子")).toBeInTheDocument();
  });

  it("メンバーの好きなものが表示される", async () => {
    render(<MemberForm />);
    await waitFor(() => {
      expect(screen.getByText("カレー")).toBeInTheDocument();
    });
    expect(screen.getByText("寿司")).toBeInTheDocument();
  });

  // ── 編集（オーナーのメンバー） ──

  it("自分のメンバーの「編集」ボタンで編集モーダルが開く", async () => {
    render(<MemberForm />);

    await waitFor(() => {
      expect(screen.getByText("太郎")).toBeInTheDocument();
    });

    // 太郎は uid="test-uid" なので編集ボタンが表示される
    const editButtons = screen.getAllByText("編集");
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("太郎さんを編集")).toBeInTheDocument();
    });
  });

  it("編集モーダルで「保存」するとAPIが呼ばれる", async () => {
    mockPut.mockResolvedValue({ data: {} });
    // refetch 用
    mockGet.mockResolvedValue({ data: MEMBERS });

    render(<MemberForm />);

    await waitFor(() => {
      expect(screen.getByText("太郎")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("編集")[0]);

    await waitFor(() => {
      expect(screen.getByText("太郎さんを編集")).toBeInTheDocument();
    });

    // モーダル内の保存ボタンをクリック
    fireEvent.click(screen.getByText("保存"));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        "/api/members/1",
        expect.objectContaining({
          member: expect.objectContaining({
            name: "太郎",
          }),
        }),
      );
    });
  });

  it("編集モーダルで「キャンセル」すると閉じる", async () => {
    render(<MemberForm />);

    await waitFor(() => {
      expect(screen.getByText("太郎")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("編集")[0]);

    await waitFor(() => {
      expect(screen.getByText("太郎さんを編集")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("キャンセル"));

    await waitFor(() => {
      expect(screen.queryByText("太郎さんを編集")).not.toBeInTheDocument();
    });
  });

  // ── 削除 ──

  it("自分のメンバーの「削除」で API が呼ばれる", async () => {
    mockDelete.mockResolvedValue({});
    mockGet.mockResolvedValue({ data: MEMBERS });

    render(<MemberForm />);

    await waitFor(() => {
      expect(screen.getByText("太郎")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("削除")[0]);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("/api/members/1");
    });
  });

  it("confirm をキャンセルすると削除されない", async () => {
    window.confirm.mockReturnValue(false);
    render(<MemberForm />);

    await waitFor(() => {
      expect(screen.getByText("太郎")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("削除")[0]);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  // ── ナビゲーション ──

  it("リクエスト管理へのリンクがある", async () => {
    render(<MemberForm />);
    const link = screen.getByText("リクエスト管理").closest("a");
    expect(link).toHaveAttribute("href", "/request");
  });

  it("冷蔵庫へのリンクがある", async () => {
    render(<MemberForm />);
    const link = screen.getByText("冷蔵庫").closest("a");
    expect(link).toHaveAttribute("href", "/stock");
  });
});
