import React from "react";
import { render, screen } from "@testing-library/react";
import { StockBadges } from "../StockBadges";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("StockBadges", () => {
  it("stocks が空のとき登録案内テキストとリンクを表示する", () => {
    render(<StockBadges stocks={[]} />);
    expect(screen.getByText(/在庫が登録されていません/)).toBeInTheDocument();
    const link = screen.getByText("冷蔵庫ページで登録する");
    expect(link.closest("a")).toHaveAttribute("href", "/stock");
  });

  it("stocks がある場合、名前・数量・単位を表示する", () => {
    const stocks = [
      { id: 1, name: "卵", quantity: 10, unit: "個" },
      { id: 2, name: "牛乳", quantity: 1, unit: "L" },
    ];
    render(<StockBadges stocks={stocks} />);
    expect(screen.getByText("卵")).toBeInTheDocument();
    expect(screen.getByText("10個")).toBeInTheDocument();
    expect(screen.getByText("牛乳")).toBeInTheDocument();
    expect(screen.getByText("1L")).toBeInTheDocument();
  });
});
