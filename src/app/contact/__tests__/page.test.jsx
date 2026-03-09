/**
 * ContactPage (app/contact/page.jsx) の統合テスト
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactPage from "@/app/contact/page";

jest.mock("next/link", () => {
  return function Link({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

const mockPost = jest.fn();
jest.mock("@/shared/lib/api", () => ({
  apiClient: { post: (...args) => mockPost(...args) },
}));

jest.mock("@/shared/lib/firebase", () => ({
  auth: { currentUser: null },
}));

describe("ContactPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("「お問い合わせ」見出しを表示する", () => {
    render(<ContactPage />);
    expect(screen.getByText("お問い合わせ")).toBeInTheDocument();
  });

  it("名前・メール・種別・メッセージのフォーム項目がある", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/お名前/)).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/お問い合わせ種別/)).toBeInTheDocument();
    expect(screen.getByLabelText(/お問い合わせ内容/)).toBeInTheDocument();
  });

  it("「送信する」ボタンがある", () => {
    render(<ContactPage />);
    expect(
      screen.getByRole("button", { name: "送信する" }),
    ).toBeInTheDocument();
  });

  it("送信成功後「送信が完了しました」を表示する", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    render(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/お名前/), {
      target: { value: "山田太郎", name: "name" },
    });
    fireEvent.change(screen.getByLabelText(/メールアドレス/), {
      target: { value: "test@example.com", name: "email" },
    });
    fireEvent.change(screen.getByLabelText(/お問い合わせ種別/), {
      target: { value: "general", name: "subject" },
    });
    fireEvent.change(screen.getByLabelText(/お問い合わせ内容/), {
      target: { value: "テストメッセージ", name: "message" },
    });

    fireEvent.click(screen.getByRole("button", { name: "送信する" }));

    await waitFor(() => {
      expect(screen.getByText("送信が完了しました")).toBeInTheDocument();
    });
  });

  it("送信失敗時にアラートを表示する", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    mockPost.mockRejectedValueOnce({
      response: { data: { error: "サーバーエラー" } },
    });

    render(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/お名前/), {
      target: { value: "山田太郎", name: "name" },
    });
    fireEvent.change(screen.getByLabelText(/メールアドレス/), {
      target: { value: "test@example.com", name: "email" },
    });
    fireEvent.change(screen.getByLabelText(/お問い合わせ種別/), {
      target: { value: "general", name: "subject" },
    });
    fireEvent.change(screen.getByLabelText(/お問い合わせ内容/), {
      target: { value: "テストメッセージ", name: "message" },
    });

    fireEvent.click(screen.getByRole("button", { name: "送信する" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("サーバーエラー");
    });

    alertSpy.mockRestore();
  });

  it("プライバシーポリシーリンクがある", () => {
    render(<ContactPage />);
    expect(screen.getByText("プライバシーポリシー")).toHaveAttribute(
      "href",
      "/privacy",
    );
  });

  it("FamDish のロゴリンクが / に向いている", () => {
    render(<ContactPage />);
    expect(screen.getByText("FamDish")).toHaveAttribute("href", "/");
  });
});
