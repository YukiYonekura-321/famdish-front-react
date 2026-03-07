import React from "react";
import { render } from "@testing-library/react";
import { AmbientBackground } from "../AmbientBackground";

describe("AmbientBackground", () => {
  it("fixed + pointer-events-none コンテナを描画する", () => {
    const { container } = render(<AmbientBackground />);
    expect(container.firstChild).toHaveClass("fixed");
    expect(container.firstChild).toHaveClass("pointer-events-none");
  });

  it("複数の装飾要素を描画する", () => {
    const { container } = render(<AmbientBackground />);
    // 少なくとも背景3つの div
    expect(container.querySelectorAll("div").length).toBeGreaterThanOrEqual(3);
  });
});
