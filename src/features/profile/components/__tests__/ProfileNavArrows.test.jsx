import React from "react";
import { render } from "@testing-library/react";
import { BackArrow, ForwardArrow } from "../ProfileNavArrows";

describe("BackArrow", () => {
  it("SVG を描画する", () => {
    const { container } = render(<BackArrow />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

describe("ForwardArrow", () => {
  it("SVG を描画する", () => {
    const { container } = render(<ForwardArrow />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
