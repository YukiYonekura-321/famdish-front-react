import React from "react";
import { render, screen } from "@testing-library/react";
import { StepsList } from "../StepsList";

const steps = [
  { step: 1, description: "お湯を沸かす" },
  { step: 2, description: "パスタを入れる" },
  { step: 3, description: "ソースを絡める" },
];

describe("StepsList", () => {
  it("steps が空配列のとき何も描画しない", () => {
    const { container } = render(<StepsList steps={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("steps が null のとき何も描画しない", () => {
    const { container } = render(<StepsList steps={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("デフォルト見出し「調理手順」を表示する", () => {
    render(<StepsList steps={steps} />);
    expect(screen.getByText("調理手順")).toBeInTheDocument();
  });

  it("カスタム見出しを表示できる", () => {
    render(<StepsList steps={steps} heading="手順一覧" />);
    expect(screen.getByText("手順一覧")).toBeInTheDocument();
  });

  it("すべてのステップ記述を表示する", () => {
    render(<StepsList steps={steps} />);
    expect(screen.getByText("お湯を沸かす")).toBeInTheDocument();
    expect(screen.getByText("パスタを入れる")).toBeInTheDocument();
    expect(screen.getByText("ソースを絡める")).toBeInTheDocument();
  });
});
