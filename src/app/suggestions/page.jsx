"use client";

import { useState } from "react";
import { useSuggestion } from "@/hooks/useSuggestion";
import { useFeedback } from "@/hooks/useFeedback";
import SuggestionCard from "@/components/SuggestionCard";
import { AuthHeader } from "@/components/auth_header";

export default function SuggestionPage() {
  const [input, setInput] = useState("");
  const { loading, suggestions, fetchSuggestions } = useSuggestion();
  const { saveFeedback } = useFeedback();

  return (
    <div className="gra-page p-6 min-h-screen mx-auto">
      <AuthHeader />

      <div className="gra-card p-6 mt-12">
        <h1 className="gra-title text-3xl mb-4">今日の献立提案</h1>
        {/* 入力欄（カンマ区切り） */}
        <div className="mb-4">
          <input
            className="gra-input"
            placeholder="例：カレー, パスタ, サラダ"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="gra-btn mt-2"
            onClick={() => {
              const requests = input.split(",").map((v) => v.trim());
              fetchSuggestions(requests);
            }}
          >
            提案を取得する
          </button>
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
