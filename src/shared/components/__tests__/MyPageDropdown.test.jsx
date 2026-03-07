import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyPageDropdown from "../MyPageDropdown";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("MyPageDropdown", () => {
  const onLogout = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("マイページボタンを描画する", () => {
    render(<MyPageDropdown onLogout={onLogout} />);
    expect(screen.getByTitle("マイページ")).toBeInTheDocument();
  });

  it("ボタンクリックでドロップダウンリンクが表示される", async () => {
    const user = userEvent.setup();
    render(<MyPageDropdown onLogout={onLogout} />);
    await user.click(screen.getByTitle("マイページ"));
    expect(
      screen.getByText(/ソーシャルアカウント連携状態/),
    ).toBeInTheDocument();
    expect(screen.getByText(/通知先メールアドレス変更/)).toBeInTheDocument();
  });

  it("ログアウトボタンで confirm → onLogout", async () => {
    const user = userEvent.setup();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    render(<MyPageDropdown onLogout={onLogout} />);
    await user.click(screen.getByTitle("マイページ"));
    await user.click(screen.getByText("ログアウト"));
    expect(window.confirm).toHaveBeenCalledWith("ログアウトしますか？");
    expect(onLogout).toHaveBeenCalledTimes(1);
    window.confirm.mockRestore();
  });

  it("confirm キャンセルで onLogout 未呼び出し", async () => {
    const user = userEvent.setup();
    jest.spyOn(window, "confirm").mockReturnValue(false);
    render(<MyPageDropdown onLogout={onLogout} />);
    await user.click(screen.getByTitle("マイページ"));
    await user.click(screen.getByText("ログアウト"));
    expect(onLogout).not.toHaveBeenCalled();
    window.confirm.mockRestore();
  });

  it("退会リンクが存在する", async () => {
    const user = userEvent.setup();
    render(<MyPageDropdown onLogout={onLogout} />);
    await user.click(screen.getByTitle("マイページ"));
    expect(screen.getByText("退会")).toBeInTheDocument();
  });
});
