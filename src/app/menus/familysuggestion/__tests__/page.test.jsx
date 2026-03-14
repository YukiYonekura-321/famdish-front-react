/**
 * FamilySuggestionPage (app/menus/familysuggestion/page.jsx) の統合テスト
 *
 * 認証ガード、家族レシピ一覧取得、料理担当者選択、
 * リクエストからの献立追加、レシピ削除を検証する。
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FamilySuggestionPage from "@/app/menus/familysuggestion/page";

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
  usePathname: () => "/menus/familysuggestion",
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

jest.mock("@/shared/components/LoadingSpinner", () => {
  return function LoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock("@/features/recipe/components/RecipeModal", () => ({
  RecipeModal: ({ show, onClose, onSave }) =>
    show ? (
      <div data-testid="recipe-modal">
        RecipeModal
        <button data-testid="modal-close" onClick={onClose}>
          閉じる
        </button>
        <button data-testid="modal-save" onClick={onSave}>
          保存
        </button>
      </div>
    ) : null,
}));

jest.mock("@/features/recipe/components/RecipeCard", () => ({
  RecipeCard: ({
    recipe,
    onDelete,
    onFetchRecipe,
    onToggleDetail,
    onServingsChange,
    servings,
  }) => (
    <div data-testid={`recipe-card-${recipe.id}`}>
      <span>{recipe.dish_name}</span>
      <button onClick={() => onDelete(recipe.id, recipe.dish_name)}>
        削除
      </button>
      <button
        onClick={() =>
          onFetchRecipe(
            recipe.dish_name,
            servings || 4,
            recipe.id,
            recipe.suggestion_id,
          )
        }
      >
        レシピ説明
      </button>
      <button onClick={() => onToggleDetail(recipe.suggestion_id, recipe.id)}>
        詳細
      </button>
      <button onClick={() => onServingsChange("2")}>人数変更</button>
    </div>
  ),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();
const mockPut = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
    delete: (...args) => mockDelete(...args),
    put: (...args) => mockPut(...args),
  },
}));

/* ────────── テストデータ ────────── */

const MEMBERS = [
  { id: 1, name: "太郎" },
  { id: 2, name: "花子" },
];

const MENUS = [
  { id: 10, name: "カレー", member: { name: "太郎" } },
  { id: 20, name: "シチュー", member: { name: "花子" } },
];

const RECIPES = [
  { id: 100, dish_name: "唐揚げ", suggestion_id: 1 },
  { id: 200, dish_name: "サラダ", suggestion_id: 2 },
];

/* ────────── テスト本体 ────────── */

describe("FamilySuggestionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockReturnValue(true);

    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: "test-uid" });
      return jest.fn();
    });

    mockGet.mockImplementation((url, opts) => {
      if (url === "/api/members") return Promise.resolve({ data: MEMBERS });
      if (url === "/api/members/me")
        return Promise.resolve({ data: { member: { id: 1 } } });
      if (url === "/api/families")
        return Promise.resolve({ data: { today_cook_id: 1 } });
      if (url === "/api/menus") return Promise.resolve({ data: MENUS });
      if (url === "/api/recipes/family")
        return Promise.resolve({ data: RECIPES });
      if (url === "/api/goods/count")
        return Promise.resolve({ data: { count: 3 } });
      return Promise.resolve({ data: {} });
    });

    mockPost.mockResolvedValue({ data: {} });
    mockDelete.mockResolvedValue({ data: {} });
    mockPut.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    window.alert.mockRestore?.();
    window.confirm.mockRestore?.();
  });

  // ── 認証 ──

  it("未認証ユーザーは /login にリダイレクトされる", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
    render(<FamilySuggestionPage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  // ── 初期表示 ──

  it("ページ見出し「わが家の献立」が表示される", async () => {
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(
        screen.getByText((text) => text.includes("わが家の献立")),
      ).toBeInTheDocument();
    });
  });

  it("AuthHeader がレンダリングされている", () => {
    render(<FamilySuggestionPage />);
    expect(screen.getByTestId("auth-header")).toBeInTheDocument();
  });

  it("採用された献立一覧が表示される", async () => {
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });
    expect(screen.getByText("サラダ")).toBeInTheDocument();
  });

  // ── レシピがない場合 ──

  it("レシピがない場合にメッセージが表示される", async () => {
    mockGet.mockImplementation((url) => {
      if (url === "/api/recipes/family") return Promise.resolve({ data: [] });
      if (url === "/api/members") return Promise.resolve({ data: MEMBERS });
      if (url === "/api/members/me")
        return Promise.resolve({ data: { member: { id: 1 } } });
      if (url === "/api/families")
        return Promise.resolve({ data: { today_cook_id: 1 } });
      if (url === "/api/menus") return Promise.resolve({ data: MENUS });
      if (url === "/api/goods/count")
        return Promise.resolve({ data: { count: 0 } });
      return Promise.resolve({ data: {} });
    });
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(
        screen.getByText("まだ採用された献立がありません"),
      ).toBeInTheDocument();
    });
  });

  // ── 料理担当者選択 ──

  it("料理担当者を選択するとAPIが呼ばれる", async () => {
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    // 料理担当者のselectを取得（最初のcombobox）
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "2" } });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/families/assign_cook", {
        member_id: 2,
      });
    });
  });

  // ── ナビゲーション ──

  it("メニュー提案ページへ戻るリンクがある", () => {
    render(<FamilySuggestionPage />);
    const links = screen.getAllByText("メニュー提案ページへ戻る");
    const navLink = links.find((el) => el.closest("a"));
    expect(navLink.closest("a")).toHaveAttribute("href", "/menus");
  });

  it("リクエスト管理ページへのリンクがある", () => {
    render(<FamilySuggestionPage />);
    const link = screen.getByText("リクエスト管理ページ").closest("a");
    expect(link).toHaveAttribute("href", "/request");
  });

  // ── 献立追加（handleAddFromMenu） ──

  it("メニュー未選択で追加ボタンを押すとアラートが表示される", async () => {
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("献立一覧に加える"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("メニューを選んでください");
    });
  });

  it("料理担当者未設定でメニューを追加するとアラートが表示される", async () => {
    // today_cook_id を null に
    mockGet.mockImplementation((url) => {
      if (url === "/api/members") return Promise.resolve({ data: MEMBERS });
      if (url === "/api/members/me")
        return Promise.resolve({ data: { member: { id: 1 } } });
      if (url === "/api/families")
        return Promise.resolve({ data: { today_cook_id: null } });
      if (url === "/api/menus") return Promise.resolve({ data: MENUS });
      if (url === "/api/recipes/family")
        return Promise.resolve({ data: RECIPES });
      if (url === "/api/goods/count")
        return Promise.resolve({ data: { count: 0 } });
      return Promise.resolve({ data: {} });
    });

    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    // メニュー選択
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "10" } });

    fireEvent.click(screen.getByText("献立一覧に加える"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("料理担当者が設定されていません"),
      );
    });
  });

  it("他のメンバーが担当者の場合は献立追加できない", async () => {
    // myMemberId=1, todayCookId=2
    mockGet.mockImplementation((url) => {
      if (url === "/api/members") return Promise.resolve({ data: MEMBERS });
      if (url === "/api/members/me")
        return Promise.resolve({ data: { member: { id: 1 } } });
      if (url === "/api/families")
        return Promise.resolve({ data: { today_cook_id: 2 } });
      if (url === "/api/menus") return Promise.resolve({ data: MENUS });
      if (url === "/api/recipes/family")
        return Promise.resolve({ data: RECIPES });
      if (url === "/api/goods/count")
        return Promise.resolve({ data: { count: 0 } });
      return Promise.resolve({ data: {} });
    });

    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "10" } });

    fireEvent.click(screen.getByText("献立一覧に加える"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("本日の料理担当者"),
      );
    });
  });

  it("メニューを選択して献立追加が成功する", async () => {
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    // メニュー選択（2つ目のcombobox）
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "10" } });

    fireEvent.click(screen.getByText("献立一覧に加える"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/api/recipes",
        expect.objectContaining({ dish_name: "カレー" }),
      );
    });
    expect(window.alert).toHaveBeenCalledWith("献立一覧に追加しました！");
  });

  it("献立追加のAPI失敗時にエラーアラートが表示される", async () => {
    mockPost.mockImplementation((url) => {
      if (url === "/api/families/assign_cook")
        return Promise.resolve({ data: {} });
      return Promise.reject(new Error("API error"));
    });

    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "10" } });

    fireEvent.click(screen.getByText("献立一覧に加える"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("献立の追加に失敗しました");
    });
  });

  // ── レシピ削除（handleDeleteRecipe） ──

  it("削除ボタンをクリックするとDELETE APIが呼ばれる", async () => {
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("削除");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("/api/recipes/100");
    });
  });

  it("削除確認でキャンセルするとAPIは呼ばれない", async () => {
    window.confirm.mockReturnValue(false);
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("削除");
    fireEvent.click(deleteButtons[0]);

    expect(mockDelete).not.toHaveBeenCalled();
  });

  // ── レシピ説明リクエスト（handleFetchRecipe） ──

  it("レシピ説明ボタンをクリックするとAPIが呼ばれモーダルが表示される", async () => {
    mockPost.mockImplementation((url) => {
      if (url === "/api/recipes/explain")
        return Promise.resolve({
          data: { recipe: { steps: "1. 切る 2. 焼く" } },
        });
      return Promise.resolve({ data: {} });
    });

    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const explainButtons = screen.getAllByText("レシピ説明");
    fireEvent.click(explainButtons[0]);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/api/recipes/explain",
        expect.objectContaining({ dish_name: "唐揚げ" }),
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("recipe-modal")).toBeInTheDocument();
    });
  });

  it("レシピ説明取得失敗時にエラーアラートが表示される", async () => {
    mockPost.mockImplementation((url) => {
      if (url === "/api/recipes/explain")
        return Promise.reject(new Error("API error"));
      return Promise.resolve({ data: {} });
    });

    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const explainButtons = screen.getAllByText("レシピ説明");
    fireEvent.click(explainButtons[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "レシピ説明の取得に失敗しました",
      );
    });
  });

  // ── レシピ詳細アコーディオン（handleToggleRecipeDetail） ──

  it("詳細ボタンをクリックするとレシピ詳細APIが呼ばれる", async () => {
    mockGet.mockImplementation((url) => {
      if (url === "/api/members") return Promise.resolve({ data: MEMBERS });
      if (url === "/api/members/me")
        return Promise.resolve({ data: { member: { id: 1 } } });
      if (url === "/api/families")
        return Promise.resolve({ data: { today_cook_id: 1 } });
      if (url === "/api/menus") return Promise.resolve({ data: MENUS });
      if (url === "/api/recipes/family")
        return Promise.resolve({ data: RECIPES });
      if (url === "/api/goods/count")
        return Promise.resolve({ data: { count: 0 } });
      if (url === "/api/recipes/100")
        return Promise.resolve({ data: { steps: "手順" } });
      return Promise.resolve({ data: {} });
    });

    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByText("詳細");
    fireEvent.click(detailButtons[0]);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/api/recipes/100");
    });
  });

  // ── 料理担当者選択エラー ──

  it("料理担当者設定失敗時にエラーメッセージが表示される", async () => {
    mockPost.mockRejectedValue(new Error("API error"));
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "2" } });

    await waitFor(() => {
      expect(
        screen.getByText("料理担当者の設定に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  // ── 人数変更 ──

  it("人数変更コールバックが動作する", async () => {
    render(<FamilySuggestionPage />);
    await waitFor(() => {
      expect(screen.getByText("唐揚げ")).toBeInTheDocument();
    });

    const servingsButtons = screen.getAllByText("人数変更");
    fireEvent.click(servingsButtons[0]);

    // クラッシュしなければOK（state更新のみ）
    expect(screen.getByText("唐揚げ")).toBeInTheDocument();
  });
});
