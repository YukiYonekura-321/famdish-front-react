import React from "react";
import { render, screen } from "@testing-library/react";
import MobileMenuItems from "../MobileMenuItems";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("MobileMenuItems", () => {
  it("「FamDishとは」リンクを表示する", () => {
    render(<MobileMenuItems onClick={jest.fn()} />);
    expect(screen.getByText("FamDishとは")).toBeInTheDocument();
  });

  it("「新規登録」リンクを /sign-in へ", () => {
    render(<MobileMenuItems onClick={jest.fn()} />);
    const link = screen.getByText("新規登録");
    expect(link.closest("a")).toHaveAttribute("href", "/sign-in");
  });

  it("「ログイン」リンクを /login へ", () => {
    render(<MobileMenuItems onClick={jest.fn()} />);
    const link = screen.getByText("ログイン");
    expect(link.closest("a")).toHaveAttribute("href", "/login");
  });
});
