import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicSuggestionCard } from "../PublicSuggestionCard";

describe("PublicSuggestionCard", () => {
  const members = [
    { id: 1, name: "太郎" },
    { id: 2, name: "花子" },
  ];
  const suggestion = {
    id: 10,
    dish_name: "肉じゃが",
    reason: "定番の和食",
    proposer_id: 1,
    family_name: "田中家",
    created_at: "2026-03-01T00:00:00Z",
    cooking_time: 30,
    servings: 4,
  };
  const defaultProps = {
    suggestion,
    members,
    goodStatus: { exists: false },
    goodCount: 5,
    onToggleGood: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("料理名を表示する", () => {
    render(<PublicSuggestionCard {...defaultProps} />);
    expect(screen.getByText(/肉じゃが/)).toBeInTheDocument();
  });

  it("理由を表示する", () => {
    render(<PublicSuggestionCard {...defaultProps} />);
    expect(screen.getByText(/定番の和食/)).toBeInTheDocument();
  });

  it("調理者名を表示する", () => {
    render(<PublicSuggestionCard {...defaultProps} />);
    expect(screen.getByText(/太郎/)).toBeInTheDocument();
  });

  it("家族名を表示する", () => {
    render(<PublicSuggestionCard {...defaultProps} />);
    expect(screen.getByText(/田中家/)).toBeInTheDocument();
  });

  it("いいね数を表示する", () => {
    render(<PublicSuggestionCard {...defaultProps} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("いいねボタンクリックで onToggleGood が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<PublicSuggestionCard {...defaultProps} />);
    await user.click(screen.getByText("🤍"));
    expect(defaultProps.onToggleGood).toHaveBeenCalledWith(10);
  });

  it("いいね済みのとき ❤️ を表示する", () => {
    render(
      <PublicSuggestionCard {...defaultProps} goodStatus={{ exists: true }} />,
    );
    expect(screen.getByText("❤️")).toBeInTheDocument();
  });

  it("調理時間と人数を表示する", () => {
    render(<PublicSuggestionCard {...defaultProps} />);
    expect(screen.getByText(/30分/)).toBeInTheDocument();
    expect(screen.getByText(/4人分/)).toBeInTheDocument();
  });
});
