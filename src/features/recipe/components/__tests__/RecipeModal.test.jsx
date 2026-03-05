import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeModal } from "../RecipeModal";

// LoadingSpinner モック
jest.mock("@/shared/components/LoadingSpinner", () => {
  return function MockSpinner() {
    return <div data-testid="loading-spinner">読み込み中…</div>;
  };
});

const mockRecipe = {
  dish_name: "カレーライス",
  servings: 4,
  cooking_time: 30,
  missing_ingredients: [
    { name: "にんじん", quantity: "2本" },
    { name: "じゃがいも", quantity: "3個" },
  ],
  steps: [
    { step: 1, description: "野菜を切る" },
    { step: 2, description: "鍋で炒める" },
    { step: 3, description: "水を加えて煮込む" },
  ],
};

describe("RecipeModal", () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 表示 / 非表示 ──

  it("show=false のとき何も描画しない", () => {
    const { container } = render(
      <RecipeModal
        show={false}
        loading={false}
        data={null}
        onClose={onClose}
        onSave={onSave}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  // ── ローディング状態 ──

  it("loading=true のときスピナーと「レシピを取得中…」を表示する", () => {
    render(
      <RecipeModal
        show={true}
        loading={true}
        data={null}
        onClose={onClose}
        onSave={onSave}
      />,
    );
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByText("レシピを取得中...")).toBeInTheDocument();
  });

  // ── レシピデータ表示 ──

  it("data ありのとき料理名・人数・調理時間を表示する", () => {
    render(
      <RecipeModal
        show={true}
        loading={false}
        data={mockRecipe}
        onClose={onClose}
        onSave={onSave}
      />,
    );
    expect(screen.getByText("カレーライス")).toBeInTheDocument();
    expect(screen.getByText("4人分")).toBeInTheDocument();
    expect(screen.getByText("30分")).toBeInTheDocument();
  });

  it("不足食材を表示する", () => {
    render(
      <RecipeModal
        show={true}
        loading={false}
        data={mockRecipe}
        onClose={onClose}
        onSave={onSave}
      />,
    );
    expect(screen.getByText(/にんじん/)).toBeInTheDocument();
    expect(screen.getByText(/じゃがいも/)).toBeInTheDocument();
  });

  it("調理手順を表示する", () => {
    render(
      <RecipeModal
        show={true}
        loading={false}
        data={mockRecipe}
        onClose={onClose}
        onSave={onSave}
      />,
    );
    expect(screen.getByText("野菜を切る")).toBeInTheDocument();
    expect(screen.getByText("鍋で炒める")).toBeInTheDocument();
    expect(screen.getByText("水を加えて煮込む")).toBeInTheDocument();
  });

  // ── ボタン操作 ──

  it("「キャンセル」クリックで onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <RecipeModal
        show={true}
        loading={false}
        data={mockRecipe}
        onClose={onClose}
        onSave={onSave}
      />,
    );
    await user.click(screen.getByText("キャンセル"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("「保存」クリックで onSave が呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <RecipeModal
        show={true}
        loading={false}
        data={mockRecipe}
        onClose={onClose}
        onSave={onSave}
      />,
    );
    await user.click(screen.getByText("保存"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  // ── エラー状態 ──

  it("data=null, loading=false のときエラーメッセージと閉じるボタンを表示", async () => {
    const user = userEvent.setup();
    render(
      <RecipeModal
        show={true}
        loading={false}
        data={null}
        onClose={onClose}
        onSave={onSave}
      />,
    );
    expect(screen.getByText("レシピの取得に失敗しました")).toBeInTheDocument();
  });

  it("エラー状態で閉じるボタンをクリックすると onClose が呼ばれる", async () => {
    const user = userEvent.setup();

    render(
      <RecipeModal
        show={true}
        loading={false}
        data={null}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByText("閉じる"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
