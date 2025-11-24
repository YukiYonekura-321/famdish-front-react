"use client";

import { useState } from "react";
import { useSuggestion } from "@/hooks/useSuggestion";
import SuggestionCard from "@/components/SuggestionCard";
import { AuthHeader } from "@/components/auth_header";

export default function SuggestionPage() {
  const [input, setInput] = useState("");
  const { loading, suggestions, fetchSuggestions } = useSuggestion();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <AuthHeader />
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
        <h1 className="text-2xl font-bold mb-4">今日の献立提案</h1>

        {/* 入力欄（カンマ区切り） */}
        <div className="mb-4">
          <input
            className="border p-2 w-full"
            placeholder="例：カレー, パスタ, サラダ"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="mt-2 bg-black text-white px-3 py-2 rounded"
            onClick={() => {
              const requests = input.split(",").map((v) => v.trim());
              fetchSuggestions(requests);
            }}
          >
            提案を取得する
          </button>
        </div>

        {loading && <p>提案を生成中です…</p>}

        {/* 提案カード一覧 */}
        {suggestions && (
          <div className="mt-4 grid gap-4">
            {suggestions.suggestions.map((s, i) => (
              <SuggestionCard
                key={i}
                index={i}
                suggestion={s}
                onOk={() => alert(`案 ${i + 1} を採用しました`)}
                onRetry={() => alert(`案 ${i + 1} の別案を要求します`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
