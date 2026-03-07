import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagInputList } from "../TagInputList";

describe("TagInputList", () => {
  const defaultProps = {
    label: "好きな食べ物",
    icon: "❤️",
    items: ["カレー"],
    candidates: ["カレー", "寿司", "ラーメン"],
    placeholder: "入力してください",
    onChange: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("ラベルとアイコンを表示する", () => {
    render(<TagInputList {...defaultProps} />);
    expect(screen.getByText(/好きな食べ物/)).toBeInTheDocument();
    expect(screen.getByText("❤️")).toBeInTheDocument();
  });

  it("候補タグをすべて表示する", () => {
    render(<TagInputList {...defaultProps} />);
    expect(screen.getByText(/カレー/)).toBeInTheDocument();
    expect(screen.getByText(/寿司/)).toBeInTheDocument();
    expect(screen.getByText(/ラーメン/)).toBeInTheDocument();
  });

  it("選択済みタグに ✓ が付く", () => {
    render(<TagInputList {...defaultProps} />);
    // カレーは items に含まれるので ✓ カレー として表示
    const btn = screen.getByRole("button", { name: /✓ カレー/ });
    expect(btn).toBeInTheDocument();
  });

  it("未選択タグをクリックで onChange が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<TagInputList {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "寿司" }));
    expect(defaultProps.onChange).toHaveBeenCalledWith(["カレー", "寿司"]);
  });

  it("選択済みタグをクリックで除外される", async () => {
    const user = userEvent.setup();
    render(<TagInputList {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /✓ カレー/ }));
    expect(defaultProps.onChange).toHaveBeenCalledWith([]);
  });

  it("「追加」ボタンで空文字を追加する", async () => {
    const user = userEvent.setup();
    render(<TagInputList {...defaultProps} />);
    await user.click(screen.getByText("追加"));
    expect(defaultProps.onChange).toHaveBeenCalledWith(["カレー", ""]);
  });

  it("テキスト入力値が表示される", () => {
    render(<TagInputList {...defaultProps} />);
    expect(screen.getByDisplayValue("カレー")).toBeInTheDocument();
  });

  it("items が複数のときに削除ボタンが表示される", () => {
    render(<TagInputList {...defaultProps} items={["カレー", "寿司"]} />);
    const deleteButtons = screen.getAllByTitle("削除");
    expect(deleteButtons.length).toBe(2);
  });

  it("削除ボタンをクリックすると該当アイテムが除外される", async () => {
    const user = userEvent.setup();
    render(<TagInputList {...defaultProps} items={["カレー", "寿司"]} />);
    const deleteButtons = screen.getAllByTitle("削除");
    await user.click(deleteButtons[0]); // 最初の削除ボタン（カレー）
    expect(defaultProps.onChange).toHaveBeenCalledWith(["寿司"]);
  });

  it("items が1つだけのときは削除ボタンが表示されない", () => {
    render(<TagInputList {...defaultProps} items={["カレー"]} />);
    const deleteButtons = screen.queryAllByTitle("削除");
    expect(deleteButtons.length).toBe(0);
  });
});
