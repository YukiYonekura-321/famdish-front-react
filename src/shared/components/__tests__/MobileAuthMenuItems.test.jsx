import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileAuthMenuItems from "../MobileAuthMenuItems";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("MobileAuthMenuItems", () => {
  const defaultProps = {
    onClick: jest.fn(),
    onLogout: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("ナビリンク（家族を招待、メンバー一覧など）を表示する", () => {
    render(<MobileAuthMenuItems {...defaultProps} />);
    expect(screen.getByText(/家族を招待/)).toBeInTheDocument();
    expect(screen.getByText(/メンバー一覧/)).toBeInTheDocument();
    expect(screen.getByText(/リクエスト/)).toBeInTheDocument();
    expect(screen.getByText(/メニュー提案/)).toBeInTheDocument();
  });

  it("「マイページ」ボタンがある", () => {
    render(<MobileAuthMenuItems {...defaultProps} />);
    expect(screen.getByText(/マイページ/)).toBeInTheDocument();
  });

  it("マイページクリックでサブメニューが表示される", async () => {
    const user = userEvent.setup();
    render(<MobileAuthMenuItems {...defaultProps} />);
    await user.click(screen.getByText(/マイページ/));
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
    expect(screen.getByText("退会")).toBeInTheDocument();
  });

  it("ログアウトボタンで confirm → onLogout 呼び出し", async () => {
    const user = userEvent.setup();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    render(<MobileAuthMenuItems {...defaultProps} />);
    await user.click(screen.getByText(/マイページ/));
    await user.click(screen.getByText("ログアウト"));
    expect(window.confirm).toHaveBeenCalledWith("ログアウトしますか？");
    expect(defaultProps.onLogout).toHaveBeenCalledTimes(1);
    window.confirm.mockRestore();
  });

  it("confirm をキャンセルすると onLogout は呼ばれない", async () => {
    const user = userEvent.setup();
    jest.spyOn(window, "confirm").mockReturnValue(false);
    render(<MobileAuthMenuItems {...defaultProps} />);
    await user.click(screen.getByText(/マイページ/));
    await user.click(screen.getByText("ログアウト"));
    expect(defaultProps.onLogout).not.toHaveBeenCalled();
    window.confirm.mockRestore();
  });
});
