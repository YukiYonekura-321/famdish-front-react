"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { apiClient } from "@/app/lib/api";
import { Header } from "@/components/header";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  const [inviteInfo, setInviteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 招待情報を取得（認証不要）
    const fetchInviteInfo = async () => {
      try {
        const res = await apiClient.get(`/api/invitations/${token}`);
        if (res.data.valid) {
          setInviteInfo(res.data);
        } else {
          setError("この招待リンクは無効または期限切れです");
        }
      } catch (err) {
        console.error("招待確認エラー:", err);
        setError("招待情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteInfo();

    // ユーザー認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      // 未ログインの場合はログインページへ
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    setAccepting(true);
    setError("");

    try {
      const res = await apiClient.post(`/api/invitations/${token}/accept`);
      alert(`${res.data.family_name}への参加が完了しました！`);
      router.push("/menus");
    } catch (err) {
      console.error("招待受諾エラー:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("招待の受諾に失敗しました");
      }
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg">招待情報を確認中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !inviteInfo) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">エラー</h1>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              ホームへ戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">家族への招待</h1>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-center text-lg mb-2">
              <span className="font-bold text-xl">
                {inviteInfo?.family_name}
              </span>
            </p>
            <p className="text-center text-gray-600">から招待されています</p>
          </div>

          {!user && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                招待を受諾するにはログインが必要です
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {accepting
                ? "処理中..."
                : user
                  ? "招待を受け入れる"
                  : "ログインして受け入れる"}
            </button>

            <button
              onClick={handleDecline}
              disabled={accepting}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              辞退する
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>招待を受け入れると、この家族のメニューや</p>
            <p>メンバー情報を共有できるようになります</p>
          </div>
        </div>
      </div>
    </div>
  );
}
