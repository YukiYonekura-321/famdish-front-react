import React from "react";
import { render, screen } from "@testing-library/react";
import { FamilyInfoBadge } from "../FamilyInfoBadge";

describe("FamilyInfoBadge", () => {
  it("familyName が null のとき何も描画しない", () => {
    const { container } = render(<FamilyInfoBadge familyName={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("familyName が空文字のとき何も描画しない", () => {
    const { container } = render(<FamilyInfoBadge familyName="" />);
    expect(container.innerHTML).toBe("");
  });

  it("familyName があるとき表示する", () => {
    render(<FamilyInfoBadge familyName="田中家" />);
    expect(screen.getByText("田中家")).toBeInTheDocument();
    expect(screen.getByText("Your Family")).toBeInTheDocument();
  });
});
