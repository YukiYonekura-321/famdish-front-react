"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  verifyBeforeUpdateEmail,
  reauthenticateWithPopup,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { getProvider } from "@/app/lib/provider-utils";
import { apiClient } from "@/app/lib/api";

export default function ProfileStep1() {
  const [email, setEmail] = useState("");
  const [optOut, setOptOut] = useState(false);
  const [linkedEmails, setLinkedEmails] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLinkedEmails(user.email);

        const res = await apiClient.get("/api/members/me");
        if (res?.data?.username) {
          // 本登録済み
          router.replace("/menus");
          return;
        }
      } else {
        setLinkedEmails([]);
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // If there are linked emails and the input is empty, prefill with the first linked email
  useEffect(() => {
    if (!email && linkedEmails) {
      setEmail(linkedEmails);
    }
  }, [linkedEmails]);

  const updateEmail = async (e) => {
    e.preventDefault();
    // 入力は制御された state (`email`) から取得する
    const inputEmail = email;
    const actionCodeSettings = {
      url: `http://${location.host}/login`,
    };

    auth.language = "ja";

    const user = auth.currentUser;

    // 登録している自分のメールアドレスを入力した場合
    if (user.email === inputEmail) {
      router.push("/profile/step2");
      return;
    }

    const provider = getProvider(user);

    try {
      // メールアドレスを更新する前に再認証。失敗するとエラーが発生する
      await reauthenticateWithPopup(user, provider);
      await verifyBeforeUpdateEmail(user, inputEmail, actionCodeSettings);
      alert(
        `${email}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`,
      );
      setEmail("");
      router.push("/profile/step2");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert(
          `${email}に確認メールを送りました。\n(他のユーザーにより登録済みのメールアドレスの場合は送信されません)`,
        );
        setEmail("");
        return;
      }
      alert(`メールの送信に失敗しました\n${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">
          Famdishからのお知らせを受け取るためのメール
        </h1>
        <p className="mb-4">
          配信を希望するメールアドレスを入力してください。配信を希望しない方はチェックを入れてください。
        </p>

        <form onSubmit={updateEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="gra-input w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="optout"
              type="checkbox"
              checked={optOut}
              onChange={(e) => setOptOut(e.target.checked)}
            />
            <label htmlFor="optout" className="text-sm">
              配信を希望しない
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-auto px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => router.push("/profile/step1-1")}
            >
              戻る
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              次へ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
