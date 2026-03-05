import React from "react";
import { render, screen } from "@testing-library/react";
import { MissingIngredients } from "../MissingIngredients";

const items = [
  { name: "醤油", quantity: "大さじ2" },
  { name: "みりん", quantity: "大さじ1" },
];

describe("MissingIngredients", () => {
  it("items が空配列のとき何も描画しない", () => {
    const { container } = render(<MissingIngredients items={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("items が null のとき何も描画しない", () => {
    const { container } = render(<MissingIngredients items={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("デフォルト見出し「不足食材」を表示する", () => {
    render(<MissingIngredients items={items} />);
    expect(screen.getByText("不足食材")).toBeInTheDocument();
  });

  it("カスタム見出しを表示できる", () => {
    render(<MissingIngredients items={items} heading="🛒 買い物リスト" />);
    expect(screen.getByText("🛒 買い物リスト")).toBeInTheDocument();
  });

  it("各食材の名前と数量を表示する", () => {
    render(<MissingIngredients items={items} />);
    expect(screen.getByText(/醤油.*大さじ2/)).toBeInTheDocument();
    expect(screen.getByText(/みりん.*大さじ1/)).toBeInTheDocument();
  });
});
