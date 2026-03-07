import React from "react";
import { render, screen } from "@testing-library/react";
import { InfoItem } from "../InfoItem";

describe("InfoItem", () => {
  it("アイコンとテキストを表示する", () => {
    render(<InfoItem icon="⏰" text="リンクは7日間有効です" />);
    expect(screen.getByText("⏰")).toBeInTheDocument();
    expect(screen.getByText("リンクは7日間有効です")).toBeInTheDocument();
  });

  it("li 要素として描画される", () => {
    const { container } = render(<InfoItem icon="🔗" text="テスト" />);
    expect(container.querySelector("li")).toBeInTheDocument();
  });
});
