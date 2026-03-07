import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableList } from "../EditableList";

describe("EditableList", () => {
  const setup = (items = [{ name: "りんご" }, { name: "みかん" }]) => {
    const setItems = jest.fn();
    const setRemovedIds = jest.fn();
    render(
      <EditableList
        label="好きな食べ物"
        items={items}
        setItems={setItems}
        setRemovedIds={setRemovedIds}
      />,
    );
    return { setItems, setRemovedIds };
  };

  it("ラベルを表示する", () => {
    setup();
    expect(screen.getByText("好きな食べ物")).toBeInTheDocument();
  });

  it("各項目の入力欄を表示する", () => {
    setup();
    expect(screen.getByDisplayValue("りんご")).toBeInTheDocument();
    expect(screen.getByDisplayValue("みかん")).toBeInTheDocument();
  });

  it("削除ボタンで setRemovedIds と setItems が呼ばれる", async () => {
    const user = userEvent.setup();
    const items = [{ id: 10, name: "りんご" }];
    const { setItems, setRemovedIds } = setup(items);
    await user.click(screen.getByText("削除"));
    expect(setRemovedIds).toHaveBeenCalled();
    expect(setItems).toHaveBeenCalledWith([]);
  });

  it("「+ 追加」ボタンで空項目追加される", async () => {
    const user = userEvent.setup();
    const { setItems } = setup([{ name: "りんご" }]);
    await user.click(screen.getByText("+ 追加"));
    expect(setItems).toHaveBeenCalledWith([{ name: "りんご" }, { name: "" }]);
  });

  it("入力変更で setItems が呼ばれる", async () => {
    const user = userEvent.setup();
    const { setItems } = setup([{ name: "りんご" }]);
    const input = screen.getByDisplayValue("りんご");
    await user.clear(input);
    await user.type(input, "バナナ");
    expect(setItems).toHaveBeenCalled();
  });
});
