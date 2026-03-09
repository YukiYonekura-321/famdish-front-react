/**
 * PrivacyPage / TermsPage / Health API の統合テスト
 */
import { render, screen } from "@testing-library/react";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import { GET } from "@/app/api/health/route";

jest.mock("next/link", () => {
  return function Link({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("PrivacyPage", () => {
  it("「プライバシーポリシー」見出しを表示する", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("プライバシーポリシー")).toBeInTheDocument();
  });

  it("FamDish のロゴリンクが / に向いている", () => {
    render(<PrivacyPage />);
    const logos = screen.getAllByText("FamDish");
    const headerLogo = logos.find(
      (el) => el.tagName === "A" && el.getAttribute("href") === "/",
    );
    expect(headerLogo).toBeTruthy();
  });
});

describe("TermsPage", () => {
  it("「利用規約」見出しを表示する", () => {
    render(<TermsPage />);
    expect(screen.getByText("利用規約")).toBeInTheDocument();
  });

  it("FamDish のロゴリンクが / に向いている", () => {
    render(<TermsPage />);
    const logos = screen.getAllByText("FamDish");
    const headerLogo = logos.find(
      (el) => el.tagName === "A" && el.getAttribute("href") === "/",
    );
    expect(headerLogo).toBeTruthy();
  });
});

describe("Health API route", () => {
  beforeAll(() => {
    // jsdom には Response が存在しないためポリフィル
    if (typeof global.Response === "undefined") {
      global.Response = class Response {
        constructor(body, init = {}) {
          this._body = body;
          this.status = init.status || 200;
        }
        async text() {
          return this._body;
        }
      };
    }
  });

  it("GET /api/health は 200 status で 'ok' を返す", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("ok");
  });
});
