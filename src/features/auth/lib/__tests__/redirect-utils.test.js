import { isValidRedirectPath, buildLoginUrl } from "../redirect-utils";

describe("isValidRedirectPath", () => {
  it("falsy な値は false", () => {
    expect(isValidRedirectPath("")).toBe(false);
    expect(isValidRedirectPath(null)).toBe(false);
    expect(isValidRedirectPath(undefined)).toBe(false);
  });

  it("http:// で始まる外部 URL は false", () => {
    expect(isValidRedirectPath("http://evil.com")).toBe(false);
  });

  it("https:// で始まる外部 URL は false", () => {
    expect(isValidRedirectPath("https://evil.com")).toBe(false);
  });

  it("// で始まるプロトコル相対 URL は false", () => {
    expect(isValidRedirectPath("//evil.com")).toBe(false);
  });

  it("/ で始まるアプリ内パスは true", () => {
    expect(isValidRedirectPath("/menus")).toBe(true);
    expect(isValidRedirectPath("/members")).toBe(true);
    expect(isValidRedirectPath("/")).toBe(true);
  });

  it("/ で始まらない相対パスは false", () => {
    expect(isValidRedirectPath("menus")).toBe(false);
  });
});

describe("buildLoginUrl", () => {
  it("redirect パラメータなしの場合 /login を返す", () => {
    expect(buildLoginUrl(null)).toBe("/login");
    expect(buildLoginUrl("")).toBe("/login");
    expect(buildLoginUrl(undefined)).toBe("/login");
  });

  it("redirect パラメータありの場合、クエリ付きの URL を返す", () => {
    expect(buildLoginUrl("/menus")).toBe("/login?redirect=%2Fmenus");
  });

  it("extras を追加できる", () => {
    expect(buildLoginUrl("/menus", "&foo=bar")).toBe(
      "/login?redirect=%2Fmenus&foo=bar",
    );
  });

  it("redirect なし + extras ありの場合、/login + extras", () => {
    expect(buildLoginUrl(null, "&foo=bar")).toBe("/login&foo=bar");
  });
});
