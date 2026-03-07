import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "../footer";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("Footer", () => {
  it("利用規約リンクを表示する", () => {
    render(<Footer />);
    const link = screen.getByText("利用規約");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/terms");
  });

  it("プライバシーポリシーリンクを表示する", () => {
    render(<Footer />);
    const link = screen.getByText("プライバシーポリシー");
    expect(link.closest("a")).toHaveAttribute("href", "/privacy");
  });

  it("お問い合わせリンクを表示する", () => {
    render(<Footer />);
    const link = screen.getByText("お問い合わせ");
    expect(link.closest("a")).toHaveAttribute("href", "/contact");
  });

  it("コピーライト表示がある", () => {
    render(<Footer />);
    expect(
      screen.getByText(/FamDish. All rights reserved/),
    ).toBeInTheDocument();
  });

  it("キャッチフレーズを表示する", () => {
    render(<Footer />);
    expect(screen.getByText(/食卓で家族は繋がる/)).toBeInTheDocument();
  });
});
