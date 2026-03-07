import React from "react";
import { render, screen } from "@testing-library/react";
import { BadgeList } from "../BadgeList";

describe("BadgeList", () => {
  it("items が空のとき emptyText を表示する", () => {
    render(
      <BadgeList items={[]} memberId={1} variant="sage" emptyText="なし" />,
    );
    expect(screen.getByText("なし")).toBeInTheDocument();
  });

  it("items がある場合、各バッジを表示する", () => {
    const items = [
      { id: 1, name: "カレー" },
      { id: 2, name: "寿司" },
    ];
    render(
      <BadgeList items={items} memberId={1} variant="sage" emptyText="なし" />,
    );
    expect(screen.getByText("カレー")).toBeInTheDocument();
    expect(screen.getByText("寿司")).toBeInTheDocument();
  });

  it("variant に応じた CSS クラスが付与される", () => {
    const items = [{ id: 1, name: "テスト" }];
    render(
      <BadgeList items={items} memberId={1} variant="sage" emptyText="" />,
    );
    expect(screen.getByText("テスト")).toHaveClass("luxury-badge-sage");
  });
});
