import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../header";

// HamburgerButton モック – onToggle に open 状態を渡すシンプル版
let capturedOnToggle;
jest.mock("@/shared/components/HamburgerButton", () => {
  return function MockHamburger({ onToggle }) {
    capturedOnToggle = onToggle;
    return (
      <button data-testid="hamburger" onClick={() => onToggle(true)}>
        Menu
      </button>
    );
  };
});

jest.mock("@/shared/components/MobileMenuItems", () => {
  return function MockMobileMenuItems({ onClick }) {
    return (
      <li>
        <button onClick={onClick}>モバイルメニュー項目</button>
      </li>
    );
  };
});

describe("Header", () => {
  it("FamDish ロゴリンクを表示する", () => {
    render(<Header />);
    const logo = screen.getByText("FamDish");
    expect(logo).toBeInTheDocument();
    expect(logo.closest("a")).toHaveAttribute("href", "/");
  });

  it("デスクトップナビにホーム・新規登録・ログインを表示", () => {
    render(<Header />);
    expect(screen.getByText("ホーム")).toBeInTheDocument();
    expect(screen.getByText("新規登録")).toBeInTheDocument();
    expect(screen.getByText("ログイン")).toBeInTheDocument();
  });

  it("ハンバーガー押下でモバイルメニューを表示する", async () => {
    const user = userEvent.setup();
    render(<Header />);
    expect(screen.queryByText("モバイルメニュー項目")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("hamburger"));
    expect(screen.getByText("モバイルメニュー項目")).toBeInTheDocument();
  });
});
