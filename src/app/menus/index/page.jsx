"use client";

import axios from "axios";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSuggestion } from "@/hooks/useSuggestion";
import { useFeedback } from "@/hooks/useFeedback";
import SuggestionCard from "@/components/SuggestionCard";
import { AuthHeader } from "@/components/auth_header";
import React from "react";

export default function MenuIndex() {
  const [menu, setMenu] = useState([]);
  const [usertoken, setUsertoken] = useState("");
  const { loading, suggestions, fetchSuggestions } = useSuggestion();
  const { saveFeedback } = useFeedback();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUsertoken(token);
      } else {
        setUsertoken("");
      }
    });

    return () => unsubscribe(); // コンポーネントアンマウント時に監視解除
  }, []);

  // トークンが変わったらメンバーを取得
  useEffect(() => {
    if (!usertoken) return; // tokenが空なら呼ばない

    const loadMenu = async () => {
      try {
        const res = await axios.get("/api/menus", {
          headers: {
            Authorization: `Bearer ${usertoken}`,
            Accept: "application/json",
          },
        });
        console.log(res.data);
        setMenu(res.data);
      } catch (error) {
        console.error("メニューの取得に失敗しました:", error);
      }
    };

    loadMenu();
  }, [usertoken]); // ← 依存配列に usertoken を入

  return (
    <div className="gra-page p-8 flex flex-col items-center">
      <AuthHeader />

      <div className="w-full flex flex-col items-center gap-6 mt-12">
        <h1 className="text-2xl font-bold gra-title">
          リクエストされたメニュー一覧
        </h1>

        <div className="w-full flex flex-col items-center gap-4 mt-6">
          {menu.map((m) => (
            <React.Fragment key={m.id}>
              <Link href={`/menus/${m.id}`}>
                <div className="gra-card w-11/12 sm:w-80 cursor-pointer">
                  <div>{m.menu}</div>
                </div>
              </Link>
              <button
                className="gra-btn mt-2"
                onClick={() => {
                  fetchSuggestions(m.menu);
                }}
              >
                提案を取得する
              </button>
            </React.Fragment>
          ))}
        </div>

        {loading && <p className="text-sm text-gray-600">提案を生成中です…</p>}
        {/* 提案カード一覧 */}

        {suggestions && (
          <div className="mt-4 grid gap-4">
            <SuggestionCard
              suggestion={suggestions.suggest_field}
              onOk={async () => {
                await saveFeedback(suggestions.id, "ok", "");
                alert("採用しました");
              }}
              onRetry={async () => {
                await saveFeedback(suggestions.id, "alt", "");
                alert("別案を要求しました");
                fetchSuggestions(
                  suggestions.suggest_field.requests,
                  suggestions.id,
                );
              }}
              onNg={async () => {
                const reason = prompt("NG 理由を入力してください（任意）:");
                await saveFeedback(suggestions.id, "ng", reason || "");
                alert("NG理由を送信しました");
                fetchSuggestions(
                  suggestions.suggest_field.requests,
                  suggestions.id,
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
