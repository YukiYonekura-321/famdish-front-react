import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuggestionCard from "../SuggestionCard";

describe("SuggestionCard", () => {
  const normalItem = {
    title: "カレーライス",
    reason: "みんな大好き",
    time: 30,
    budget: 1500,
    ingredients: ["にんじん", "じゃがいも", "豚肉"],
  };

  const errorItem = {
    title: "料理は作れません",
    reason: "予算が足りません",
    ingredients: ["高級食材"],
  };

  const onOk = jest.fn();
  const onRetry = jest.fn();
  const onNg = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  // ── 正常表示 ──

  it("料理名と理由を表示する", () => {
    render(
      <SuggestionCard
        suggestion={normalItem}
        onOk={onOk}
        onRetry={onRetry}
        onNg={onNg}
      />,
    );
    expect(screen.getByText("カレーライス")).toBeInTheDocument();
    expect(screen.getByText("みんな大好き")).toBeInTheDocument();
  });

  it("調理時間と予算を表示する", () => {
    render(
      <SuggestionCard
        suggestion={normalItem}
        onOk={onOk}
        onRetry={onRetry}
        onNg={onNg}
      />,
    );
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
  });

  it("材料バッジを表示する", () => {
    render(
      <SuggestionCard
        suggestion={normalItem}
        onOk={onOk}
        onRetry={onRetry}
        onNg={onNg}
      />,
    );
    expect(screen.getByText("にんじん")).toBeInTheDocument();
    expect(screen.getByText("じゃがいも")).toBeInTheDocument();
    expect(screen.getByText("豚肉")).toBeInTheDocument();
  });

  // ── アクションボタン ──

  it("「この献立に決定」クリックで onOk が呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <SuggestionCard
        suggestion={normalItem}
        onOk={onOk}
        onRetry={onRetry}
        onNg={onNg}
      />,
    );
    await user.click(screen.getByText("この献立に決定"));
    expect(onOk).toHaveBeenCalledTimes(1);
  });

  it("「別の案を見る」クリックで onRetry が呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <SuggestionCard
        suggestion={normalItem}
        onOk={onOk}
        onRetry={onRetry}
        onNg={onNg}
      />,
    );
    await user.click(screen.getByText("別の案を見る"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("「フィードバック」クリックで onNg が呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <SuggestionCard
        suggestion={normalItem}
        onOk={onOk}
        onRetry={onRetry}
        onNg={onNg}
      />,
    );
    await user.click(screen.getByText("フィードバック"));
    expect(onNg).toHaveBeenCalledTimes(1);
  });

  // ── エラー表示 ──

  it("エラーカードで「料理は作れません」と理由を表示する", () => {
    render(
      <SuggestionCard
        suggestion={errorItem}
        onOk={onOk}
        onRetry={onRetry}
        onNg={onNg}
      />,
    );
    expect(screen.getByText("料理は作れません")).toBeInTheDocument();
    expect(screen.getByText("予算が足りません")).toBeInTheDocument();
  });

  // ── 複数日 ──

  it("配列を渡すと複数日分のカードを描画する", () => {
    const multiDay = [
      { ...normalItem, day: 1, title: "1日目のカレー" },
      { ...normalItem, day: 2, title: "2日目のパスタ" },
    ];
    render(
      <SuggestionCard
        suggestion={multiDay}
        onOk={onOk}
        onRetry={onRetry}
        onNg={onNg}
      />,
    );
    expect(screen.getByText("1日目のカレー")).toBeInTheDocument();
    expect(screen.getByText("2日目のパスタ")).toBeInTheDocument();
    expect(screen.getByText("1日目")).toBeInTheDocument();
    expect(screen.getByText("2日目")).toBeInTheDocument();
  });
});
