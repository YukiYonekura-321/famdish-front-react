import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProviderLinkTable } from "../ProviderLinkTable";

// hooks & providers モック
const mockLinkProvider = jest.fn();
const mockUnlinkProvider = jest.fn();

jest.mock("@/features/auth/hooks/useProviderLink", () => ({
  useProviderLink: () => ({
    linkedProviders: ["google.com"],
    canUnlink: false,
    error: "",
    processing: false,
    linkProvider: mockLinkProvider,
    unlinkProvider: mockUnlinkProvider,
  }),
}));

jest.mock("@/features/auth/lib/providers", () => ({
  PROVIDERS: [
    { id: "google.com", name: "Google", provider: {} },
    { id: "twitter.com", name: "X(Twitter)", provider: {} },
    { id: "github.com", name: "Github", provider: {} },
  ],
}));

describe("ProviderLinkTable", () => {
  const user = { uid: "u1" };

  beforeEach(() => jest.clearAllMocks());

  it("全プロバイダ名を表示する", () => {
    render(<ProviderLinkTable user={user} />);
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("X(Twitter)")).toBeInTheDocument();
    expect(screen.getByText("Github")).toBeInTheDocument();
  });

  it("連携済みプロバイダに「連携済み」バッジを表示", () => {
    render(<ProviderLinkTable user={user} />);
    expect(screen.getByText("連携済み")).toBeInTheDocument();
  });

  it("未連携プロバイダに「未連携」バッジと「連携する」ボタンを表示", () => {
    render(<ProviderLinkTable user={user} />);
    const badges = screen.getAllByText("未連携");
    expect(badges.length).toBe(2); // Twitter, Github
    expect(screen.getAllByText("連携する").length).toBe(2);
  });

  it("「連携する」クリックで linkProvider が呼ばれる", async () => {
    const userEv = userEvent.setup();
    render(<ProviderLinkTable user={user} />);
    const buttons = screen.getAllByText("連携する");
    await userEv.click(buttons[0]);
    expect(mockLinkProvider).toHaveBeenCalledTimes(1);
  });

  it("canUnlink=false のとき「解除」ボタンは表示されない", () => {
    render(<ProviderLinkTable user={user} />);
    expect(screen.queryByText("解除")).not.toBeInTheDocument();
  });
});
