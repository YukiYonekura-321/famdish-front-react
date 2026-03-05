import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeAccordion } from "../RecipeAccordion";

jest.mock("@/shared/components/LoadingSpinner", () => {
  return function MockSpinner() {
    return <div data-testid="loading-spinner" />;
  };
});

const detailData = {
  servings: 4,
  cooking_time: 25,
  missing_ingredients: [{ name: "玉ねぎ", quantity: "1個" }],
  steps: [
    { step: 1, description: "材料を切る" },
    { step: 2, description: "炒める" },
  ],
};

describe("RecipeAccordion", () => {
  const onToggle = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("閉じた状態ではトグルボタンのみ表示（「見る」テキスト）", () => {
    render(
      <RecipeAccordion
        isExpanded={false}
        isLoading={false}
        detail={null}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText(/保存済みレシピを見る/)).toBeInTheDocument();
  });

  it("トグルボタンクリックで onToggle が呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <RecipeAccordion
        isExpanded={false}
        isLoading={false}
        detail={null}
        onToggle={onToggle}
      />,
    );
    await user.click(screen.getByText(/保存済みレシピを見る/));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("展開かつローディング中にスピナーが表示される", () => {
    render(
      <RecipeAccordion
        isExpanded={true}
        isLoading={true}
        detail={null}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("展開かつデータありで人数・調理時間・手順を表示する", () => {
    render(
      <RecipeAccordion
        isExpanded={true}
        isLoading={false}
        detail={detailData}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText("4人分")).toBeInTheDocument();
    expect(screen.getByText("25分")).toBeInTheDocument();
    expect(screen.getByText(/玉ねぎ/)).toBeInTheDocument();
    expect(screen.getByText("材料を切る")).toBeInTheDocument();
    expect(screen.getByText("炒める")).toBeInTheDocument();
  });

  it("展開かつ detail=null で「保存済みレシピがありません」メッセージを表示する", () => {
    render(
      <RecipeAccordion
        isExpanded={true}
        isLoading={false}
        detail={null}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText(/保存済みレシピがありません/)).toBeInTheDocument();
  });

  it("展開状態ではボタンテキストが「閉じる」に変わる", () => {
    render(
      <RecipeAccordion
        isExpanded={true}
        isLoading={false}
        detail={null}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText(/保存済みレシピを閉じる/)).toBeInTheDocument();
  });
});
