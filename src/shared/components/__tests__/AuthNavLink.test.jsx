import React from "react";
import { render, screen } from "@testing-library/react";
import AuthNavLink from "../AuthNavLink";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("AuthNavLink", () => {
  it("href とラベルを表示する", () => {
    render(<AuthNavLink href="/members">メンバー</AuthNavLink>);
    expect(screen.getByText("メンバー")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/members");
  });

  it("アイコンが表示される", () => {
    render(
      <AuthNavLink href="/menus" icon="📋">
        メニュー
      </AuthNavLink>,
    );
    expect(screen.getByText("📋")).toBeInTheDocument();
  });

  it("title 属性が文字列の children にセットされる", () => {
    render(<AuthNavLink href="/test">テスト</AuthNavLink>);
    expect(screen.getByRole("link")).toHaveAttribute("title", "テスト");
  });
});
