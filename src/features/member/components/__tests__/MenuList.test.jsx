import React from "react";
import { render, screen } from "@testing-library/react";
import { MenuList } from "../MenuList";

describe("MenuList", () => {
  it("menus 配列があれば各メニュー名を表示する", () => {
    const member = {
      id: 1,
      menus: [
        { id: 1, name: "カレー" },
        { id: 2, name: "パスタ" },
      ],
    };
    render(<MenuList member={member} />);
    expect(screen.getByText(/カレー/)).toBeInTheDocument();
    expect(screen.getByText(/パスタ/)).toBeInTheDocument();
  });

  it("単数 menu があれば表示する", () => {
    const member = { id: 1, menus: [], menu: { name: "寿司" } };
    render(<MenuList member={member} />);
    expect(screen.getByText(/寿司/)).toBeInTheDocument();
  });

  it("menu も menus も無い場合「未提案」を表示する", () => {
    const member = { id: 1 };
    render(<MenuList member={member} />);
    expect(screen.getByText("未提案")).toBeInTheDocument();
  });
});
