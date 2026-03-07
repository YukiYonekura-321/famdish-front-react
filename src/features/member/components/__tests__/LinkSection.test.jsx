import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinkSection } from "../LinkSection";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("LinkSection", () => {
  const defaultProps = {
    inviteUrl: "https://example.com/invite/abc123",
    copied: false,
    onCopy: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("「招待リンク」見出しを表示する", () => {
    render(<LinkSection {...defaultProps} />);
    expect(screen.getByText("招待リンク")).toBeInTheDocument();
  });

  it("招待 URL を input に表示する", () => {
    render(<LinkSection {...defaultProps} />);
    expect(
      screen.getByDisplayValue("https://example.com/invite/abc123"),
    ).toBeInTheDocument();
  });

  it("copied=false で「リンクをコピー」を表示する", () => {
    render(<LinkSection {...defaultProps} />);
    expect(screen.getByText("リンクをコピー")).toBeInTheDocument();
  });

  it("copied=true で「コピーしました」を表示する", () => {
    render(<LinkSection {...defaultProps} copied={true} />);
    expect(screen.getByText("コピーしました")).toBeInTheDocument();
  });

  it("コピーボタンクリックで onCopy が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<LinkSection {...defaultProps} />);
    await user.click(screen.getByText("リンクをコピー"));
    expect(defaultProps.onCopy).toHaveBeenCalledTimes(1);
  });
});
