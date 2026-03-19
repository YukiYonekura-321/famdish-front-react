/**
 * Playwright グローバルセットアップ
 *
 * - 環境変数のバリデーション
 * - バックエンド API のヘルスチェック
 */

export default async function globalSetup() {
  const baseUrl = process.env.E2E_BASE_URL || "http://localhost:3000";
  const apiUrl = process.env.E2E_API_BASE_URL || "";

  console.log(`\n🌐 E2E Base URL   : ${baseUrl}`);
  console.log(`🔗 API Base URL   : ${apiUrl || "(same origin)"}`);

  // フロントエンドの疎通チェック
  try {
    const res = await fetch(baseUrl, { method: "HEAD" });
    if (!res.ok) {
      console.warn(`⚠️  Frontend returned status ${res.status}`);
    } else {
      console.log("✅ Frontend is reachable");
    }
  } catch (err) {
    console.error(`❌ Frontend is unreachable at ${baseUrl}: ${err.message}`);
    if (process.env.CI) {
      throw new Error(`Frontend unreachable: ${baseUrl}`);
    }
  }

  // Firebase Auth Emulator のヘルスチェック
  const emulatorHost =
    process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
  const emulatorUrl = `http://${emulatorHost}`;
  console.log(`🔥 Emulator      : ${emulatorUrl}`);
  try {
    const res = await fetch(emulatorUrl, { method: "GET" });
    if (res.ok || res.status === 200) {
      console.log("✅ Firebase Auth Emulator is running");
    } else {
      console.warn(
        `⚠️  Auth Emulator returned status ${res.status}`,
      );
    }
  } catch (err) {
    console.error(
      `❌ Firebase Auth Emulator is not running at ${emulatorUrl}`,
    );
    console.error(
      '   Start it with: firebase emulators:start --only auth',
    );
    throw new Error(`Auth Emulator unreachable: ${emulatorUrl}`);
  }

  // バックエンド API のヘルスチェック（設定されている場合）
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/health`);
      if (res.ok) {
        console.log("✅ Backend API is healthy");
      } else {
        console.warn(`⚠️  Backend API returned status ${res.status}`);
      }
    } catch (err) {
      console.warn(
        `⚠️  Backend API unreachable at ${apiUrl}: ${err.message}`,
      );
    }
  }

  console.log("");
}
