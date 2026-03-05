import React from "react";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("「プロフィール登録」テキストを表示する", () => {
    render(<ProgressBar current={2} total={5} />);
    expect(screen.getByText("プロフィール登録")).toBeInTheDocument();
  });

  it("ステップ番号を表示する", () => {
    render(<ProgressBar current={3} total={5} />);
    expect(screen.getByText("ステップ 3/5")).toBeInTheDocument();
  });

  it("プログレスバーの幅が correct %", () => {
    const { container } = render(<ProgressBar current={1} total={4} />);
    const bar = container.querySelector("[style]");
    // 1/4 = 25%
    expect(bar).toHaveStyle({ width: "25%" });
  });
});
