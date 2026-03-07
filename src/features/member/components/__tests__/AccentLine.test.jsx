import React from "react";
import { render } from "@testing-library/react";
import { AccentLine } from "../AccentLine";

describe("AccentLine", () => {
  it("背景グラデーションが適用される", () => {
    const { container } = render(
      <AccentLine colors="var(--gold-400), var(--sage-400)" />,
    );
    const el = container.firstChild;
    expect(el).toHaveStyle({
      background: "linear-gradient(90deg, var(--gold-400), var(--sage-400))",
    });
  });

  it("h-1 クラスがある", () => {
    const { container } = render(<AccentLine colors="red, blue" />);
    expect(container.firstChild).toHaveClass("h-1");
  });
});
