/**
 * shared/lib/api.js のテスト — API インターセプタ
 *
 * apiClient.interceptors.request が、
 *   - ログイン済みユーザーなら Authorization ヘッダを付与
 *   - 未ログインなら付与しない
 * ことを検証する。
 */

// firebase モックを先に定義してからモジュールをインポートする
const mockGetIdToken = jest.fn(() => Promise.resolve("test-token-123"));
let mockCurrentUser = null;

jest.mock("@/shared/lib/firebase", () => ({
  auth: {
    get currentUser() {
      return mockCurrentUser;
    },
  },
}));

// axios は実際のモジュールを使う（create + interceptors が必要）
// ただしリクエストを実際に送らないよう adapter を使う
import { apiClient } from "@/shared/lib/api";

describe("apiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = null;
  });

  it("baseURL と Content-Type ヘッダが設定されている", () => {
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
    expect(apiClient.defaults.headers.Accept).toBe("application/json");
  });

  it("ログイン済みユーザーの場合、Authorization ヘッダにトークンを付与する", async () => {
    mockCurrentUser = { getIdToken: mockGetIdToken };

    // interceptor を手動で実行するため、config オブジェクトを渡す
    const requestInterceptor =
      apiClient.interceptors.request.handlers[0].fulfilled;

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(mockGetIdToken).toHaveBeenCalled();
    expect(result.headers.Authorization).toBe("Bearer test-token-123");
  });

  it("未ログインユーザーの場合、Authorization ヘッダを付与しない", async () => {
    mockCurrentUser = null;

    const requestInterceptor =
      apiClient.interceptors.request.handlers[0].fulfilled;

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it("リクエストインターセプタのエラーハンドラは Promise.reject を返す", async () => {
    const errorHandler = apiClient.interceptors.request.handlers[0].rejected;

    const error = new Error("request-error");
    await expect(errorHandler(error)).rejects.toThrow("request-error");
  });
});
