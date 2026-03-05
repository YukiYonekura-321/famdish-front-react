import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeCard } from "../RecipeCard";

const members = [
  { id: 1, name: "太郎" },
  { id: 2, name: "花子" },
];

const baseRecipe = {
  id: 10,
  dish_name: "肉じゃが",
  reason: "みんな大好き",
  proposer_id: 1,
  suggestion_id: 99,
  created_at: "2026-03-01T10:00:00Z",
};

describe("RecipeCard", () => {
  const defaultProps = {
    recipe: baseRecipe,
    members,
    myMemberId: 1,
    servings: "4",
    onServingsChange: jest.fn(),
    onFetchRecipe: jest.fn(),
    onDelete: jest.fn(),
    expandedRecipeId: null,
    recipeDetailMap: {},
    recipeDetailLoading: {},
    onToggleDetail: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("料理名・理由・調理者名を表示する", () => {
    render(<RecipeCard {...defaultProps} />);
    expect(screen.getByText(/肉じゃが/)).toBeInTheDocument();
    expect(screen.getByText(/みんな大好き/)).toBeInTheDocument();
    expect(screen.getByText(/太郎/)).toBeInTheDocument();
  });

  it("人数セレクトが初期値 4 でレンダリングされる", () => {
    render(<RecipeCard {...defaultProps} />);
    const select = screen.getByDisplayValue("4人分");
    expect(select).toBeInTheDocument();
  });

  it("人数変更で onServingsChange が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<RecipeCard {...defaultProps} />);
    const select = screen.getByDisplayValue("4人分");
    await user.selectOptions(select, "2");
    expect(defaultProps.onServingsChange).toHaveBeenCalledWith("2");
  });

  it("「AIに提案してもらう」ボタンで onFetchRecipe が正しい引数で呼ばれる", async () => {
    const user = userEvent.setup();
    render(<RecipeCard {...defaultProps} />);
    const btn = screen.getByText(/AIに提案してもらう/);
    await user.click(btn);
    expect(defaultProps.onFetchRecipe).toHaveBeenCalledWith(
      "肉じゃが",
      "4",
      10,
      99,
    );
  });

  it("自分が調理者でない場合、AIボタンを押すと alert が出て onFetchRecipe は呼ばれない", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<RecipeCard {...defaultProps} myMemberId={2} />);
    const btn = screen.getByText(/AIに提案してもらう/);
    await user.click(btn);
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("調理者"));
    expect(defaultProps.onFetchRecipe).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("削除ボタンクリックで onDelete が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<RecipeCard {...defaultProps} />);
    const deleteBtn = screen.getByTitle("この献立を削除");
    await user.click(deleteBtn);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(10, "肉じゃが");
  });

  it("アコーディオンの表示切替ボタンがある", () => {
    render(<RecipeCard {...defaultProps} />);
    expect(screen.getByText(/保存済みレシピを見る/)).toBeInTheDocument();
  });
});
