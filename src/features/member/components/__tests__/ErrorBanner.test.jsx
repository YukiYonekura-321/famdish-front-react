import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorBanner } from "../ErrorBanner";

describe("ErrorBanner", () => {
  it("message が空のとき何も描画しない", () => {
    const { container } = render(<ErrorBanner message="" />);
    expect(container.innerHTML).toBe("");
  });

  it("message=null でも何も描画しない", () => {
    const { container } = render(<ErrorBanner message={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("message があるとき「エラーが発生しました」と内容を表示する", () => {
    render(<ErrorBanner message="通信エラー" />);
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText("通信エラー")).toBeInTheDocument();
  });
});
