import React from "react";
import { render, screen } from "@testing-library/react";
import DropdownLink from "../DropdownLink";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("DropdownLink", () => {
  it("通常リンクを表示する", () => {
    render(<DropdownLink href="/mypage/email">メール設定</DropdownLink>);
    const link = screen.getByText("メール設定");
    expect(link.closest("a")).toHaveAttribute("href", "/mypage/email");
  });

  it("danger=true のとき danger スタイルで表示する", () => {
    render(
      <DropdownLink href="/mypage/withdraw" danger>
        退会
      </DropdownLink>,
    );
    const link = screen.getByText("退会");
    expect(link.closest("a")).toHaveAttribute("href", "/mypage/withdraw");
  });

  it("danger=false がデフォルト", () => {
    const { container } = render(
      <DropdownLink href="/test">普通</DropdownLink>,
    );
    // terracotta クラスが含まれないことを確認
    expect(container.querySelector("a")).not.toHaveClass(
      "hover:bg-[var(--terracotta-50)]",
    );
  });
});
