"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";
import { Header } from "@/components/header";

export default function CreateInvitePage() {
  const router = useRouter();
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      // メンバー情報を取得して家族オーナーかチェック
      try {
        const res = await apiClient.get("/api/members/me");
        if (!res?.data?.member) {
          router.replace("/profile/step1");
          return;
        }
        setMemberInfo(res.data);
      } catch (err) {
        console.error("メンバー情報取得エラー:", err);
        setError("メンバー情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setCopied(false);

    try {
      const res = await apiClient.post("/api/invitations");
      setInvitation(res.data);
    } catch (err) {
      console.error("招待生成エラー:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("招待リンクの生成に失敗しました");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!invitation?.invite_url) return;

    try {
      await navigator.clipboard.writeText(invitation.invite_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("コピーエラー:", err);
      alert("クリップボードへのコピーに失敗しました");
    }
  };

  const formatExpiresAt = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6">家族への招待リンク生成</h1>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-bold">家族名:</span>{" "}
                {memberInfo?.family_name || "未設定"}
              </p>
              <p className="text-sm text-gray-600">
                この招待リンクを使って、他のメンバーを家族に追加できます。
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {!invitation ? (
              <div className="space-y-4">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  {generating ? "生成中..." : "招待リンクを生成"}
                </button>

                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <h3 className="font-bold mb-2">招待リンクについて</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>リンクは7日間有効です</li>
                    <li>リンクを受け取った人は、家族に参加できます</li>
                    <li>必要に応じて何度でも生成できます</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800 font-bold mb-2">
                    ✓ 招待リンクを生成しました
                  </p>
                  <p className="text-sm text-green-700">
                    有効期限: {formatExpiresAt(invitation.expires_at)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    招待リンク
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={invitation.invite_url}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition whitespace-nowrap"
                    >
                      {copied ? "✓ コピー済み" : "コピー"}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <span className="font-bold">注意:</span>{" "}
                    このリンクを知っている人は誰でも家族に参加できます。信頼できる人にのみ共有してください。
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setInvitation(null)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
                  >
                    新しいリンクを生成
                  </button>
                  <button
                    onClick={() => router.push("/menus")}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    メニュー一覧へ
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:underline"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
