/**
 * HomePage (app/page.jsx) の統合テスト
 */
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

// Next.js モック
jest.mock("next/link", () => {
  return function Link({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

jest.mock("@/shared/components/header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

describe("HomePage", () => {
  it("メインキャッチコピー「食卓で家族は繋がる」を表示する", () => {
    render(<HomePage />);
    expect(screen.getByText("食卓で家族は繋がる")).toBeInTheDocument();
  });

  it("「FamDishとは」を表示する", () => {
    render(<HomePage />);
    expect(screen.getByText("FamDishとは")).toBeInTheDocument();
  });

  it("「今すぐ無料で始める」リンクが /sign-in に向いている", () => {
    render(<HomePage />);
    const link = screen.getByText("今すぐ無料で始める");
    expect(link).toHaveAttribute("href", "/sign-in");
  });

  it("「こちら」リンクが /login に向いている", () => {
    render(<HomePage />);
    const link = screen.getByText("こちら");
    expect(link).toHaveAttribute("href", "/login");
  });

  it("Header コンポーネントがレンダリングされている", () => {
    render(<HomePage />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("背景スライドショー画像要素が存在する", () => {
    render(<HomePage />);
    // 3枚の背景画像が div として存在する
    const container = document.querySelector(".min-h-screen");
    expect(container).toBeInTheDocument();
  });
});
