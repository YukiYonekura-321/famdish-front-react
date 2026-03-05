import React from "react";
import { render } from "@testing-library/react";
import { ArrowIcon } from "../ArrowIcon";

describe("ArrowIcon", () => {
  it("SVG 要素を描画する", () => {
    const { container } = render(<ArrowIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("w-5 h-5 クラスがある", () => {
    const { container } = render(<ArrowIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-5");
    expect(svg).toHaveClass("h-5");
  });
});
