import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("「準備中です…」テキストを表示する", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText("準備中です…")).toBeInTheDocument();
  });

  it("スピナーの外側コンテナが描画される", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toHaveClass("flex");
  });
});
