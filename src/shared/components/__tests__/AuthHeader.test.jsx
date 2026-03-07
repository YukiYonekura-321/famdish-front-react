import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthHeader } from "../auth_header";

/* ── Firebase モック ── */
const mockSignOut = jest.fn().mockResolvedValue(undefined);
let authCallback;
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth, cb) => {
    authCallback = cb;
    // 即座にログインユーザーを通知
    cb({ uid: "u1" });
    return jest.fn(); // unsubscribe
  },
  signOut: (...args) => mockSignOut(...args),
}));

jest.mock("@/shared/lib/firebase", () => ({ auth: {} }));

/* ── apiClient モック ── */
jest.mock("@/shared/lib/api", () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({ data: { family_name: "山田家" } }),
  },
}));

/* ── ナビ項目モック ── */
jest.mock("@/shared/components/nav-items", () => ({
  NAV_ITEMS: [
    { href: "/menus", label: "メニュー提案", icon: "🍽" },
    { href: "/stock", label: "食材管理", icon: "📦" },
  ],
  MYPAGE_LINKS: [],
}));

/* ── 子コンポーネントモック ── */
jest.mock("@/shared/components/AuthNavLink", () => {
  return function MockAuthNavLink({ href, children }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("@/shared/components/MyPageDropdown", () => {
  return function MockMyPageDropdown({ onLogout }) {
    return <button onClick={onLogout}>ログアウト</button>;
  };
});

jest.mock("@/shared/components/HamburgerButton", () => {
  return function MockHamburger({ onToggle }) {
    return (
      <button data-testid="hamburger" onClick={() => onToggle(true)}>
        Menu
      </button>
    );
  };
});

jest.mock("@/shared/components/MobileAuthMenuItems", () => {
  return function MockMobileAuth({ onClick, onLogout }) {
    return (
      <li>
        <button onClick={onClick}>モバイル認証メニュー</button>
      </li>
    );
  };
});

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe("AuthHeader", () => {
  beforeEach(() => jest.clearAllMocks());

  it("ファミリー名を取得して表示する", async () => {
    render(<AuthHeader />);
    await waitFor(() => {
      expect(screen.getByText("山田家")).toBeInTheDocument();
    });
  });

  it("デスクトップナビ項目を表示する", () => {
    render(<AuthHeader />);
    expect(screen.getByText("メニュー提案")).toBeInTheDocument();
    expect(screen.getByText("食材管理")).toBeInTheDocument();
  });

  it("ログアウトで signOut → /login へ遷移", async () => {
    const user = userEvent.setup();
    render(<AuthHeader />);
    await user.click(screen.getByText("ログアウト"));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("ハンバーガーでモバイルメニューを表示", async () => {
    const user = userEvent.setup();
    render(<AuthHeader />);
    expect(screen.queryByText("モバイル認証メニュー")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("hamburger"));
    expect(screen.getByText("モバイル認証メニュー")).toBeInTheDocument();
  });
});
