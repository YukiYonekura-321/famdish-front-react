import React from "react";
import { render } from "@testing-library/react";
import ChevronIcon from "../ChevronIcon";

describe("ChevronIcon", () => {
  it("SVG 要素を描画する", () => {
    const { container } = render(<ChevronIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("open=false のとき rotate-180 クラスを持たない", () => {
    const { container } = render(<ChevronIcon open={false} />);
    expect(container.querySelector("svg")).not.toHaveClass("rotate-180");
  });

  it("open=true のとき rotate-180 クラスを持つ", () => {
    const { container } = render(<ChevronIcon open={true} />);
    expect(container.querySelector("svg")).toHaveClass("rotate-180");
  });

  it("カスタム className が適用される", () => {
    const { container } = render(<ChevronIcon className="text-red-500" />);
    expect(container.querySelector("svg")).toHaveClass("text-red-500");
  });
});
