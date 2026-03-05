import React from "react";
import { render } from "@testing-library/react";
import { CheckBadge, XBadge } from "../Badges";

describe("CheckBadge", () => {
  it("SVG チェックアイコンを描画する", () => {
    const { container } = render(<CheckBadge />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("sage-500 背景クラスがある", () => {
    const { container } = render(<CheckBadge />);
    expect(container.firstChild).toHaveClass("bg-[var(--sage-500)]");
  });
});

describe("XBadge", () => {
  it("SVG ×アイコンを描画する", () => {
    const { container } = render(<XBadge />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("secondary 背景クラスがある", () => {
    const { container } = render(<XBadge />);
    expect(container.firstChild).toHaveClass("bg-[var(--secondary)]");
  });
});
