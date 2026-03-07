import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileNavLink from "../MobileNavLink";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("MobileNavLink", () => {
  it("href と children を表示する", () => {
    render(<MobileNavLink href="/test">テスト</MobileNavLink>);
    const link = screen.getByText("テスト");
    expect(link.closest("a")).toHaveAttribute("href", "/test");
  });

  it("クリックで onClick が呼ばれる", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <MobileNavLink href="/" onClick={onClick}>
        ホーム
      </MobileNavLink>,
    );
    await user.click(screen.getByText("ホーム"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("li 要素で囲まれている", () => {
    const { container } = render(
      <MobileNavLink href="/">リンク</MobileNavLink>,
    );
    expect(container.querySelector("li")).toBeInTheDocument();
  });
});
