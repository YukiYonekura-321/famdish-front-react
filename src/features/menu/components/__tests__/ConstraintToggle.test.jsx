import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConstraintToggle } from "../ConstraintToggle";

describe("ConstraintToggle", () => {
  const onSelect = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("「予算で絞る」と「調理時間で絞る」ボタンを表示する", () => {
    render(<ConstraintToggle constraintType="budget" onSelect={onSelect} />);
    expect(screen.getByText(/予算で絞る/)).toBeInTheDocument();
    expect(screen.getByText(/調理時間で絞る/)).toBeInTheDocument();
  });

  it("budget クリックで onSelect('budget') が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<ConstraintToggle constraintType="time" onSelect={onSelect} />);
    await user.click(screen.getByText(/予算で絞る/));
    expect(onSelect).toHaveBeenCalledWith("budget");
  });

  it("time クリックで onSelect('time') が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<ConstraintToggle constraintType="budget" onSelect={onSelect} />);
    await user.click(screen.getByText(/調理時間で絞る/));
    expect(onSelect).toHaveBeenCalledWith("time");
  });

  it("選択中タイプのボタンにアクティブスタイルが適用される", () => {
    render(<ConstraintToggle constraintType="budget" onSelect={onSelect} />);
    const activeBtn = screen.getByText(/予算で絞る/).closest("button");
    expect(activeBtn).toHaveClass("bg-[var(--sage-100)]");
  });
});
