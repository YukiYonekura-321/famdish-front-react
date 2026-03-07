import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HamburgerButton from "../HamburgerButton";

describe("HamburgerButton", () => {
  it("aria-label='Menu' のボタンを描画する", () => {
    render(<HamburgerButton />);
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
  });

  it("クリックで onToggle が呼ばれる", async () => {
    const onToggle = jest.fn();
    const user = userEvent.setup();
    render(<HamburgerButton onToggle={onToggle} />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("2回クリックで open=false を返す", async () => {
    const onToggle = jest.fn();
    const user = userEvent.setup();
    render(<HamburgerButton onToggle={onToggle} />);
    const btn = screen.getByRole("button", { name: "Menu" });
    await user.click(btn);
    await user.click(btn);
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });

  it("onToggle 未指定でもエラーにならない", async () => {
    const user = userEvent.setup();
    render(<HamburgerButton />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
  });
});
