"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfileStep3() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">
          あなたの好きなものと嫌いなものを教えてください。
        </h1>
        <p className="mb-4">このステップは40秒で完了します。</p>
        <div className="flex justify-end">
          <button
            type="button"
            className="mr-auto px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={() => router.push("/profile/step2")}
          >
            戻る
          </button>
          <Link
            href="/profile/step3-1"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            次へ
          </Link>
        </div>
      </div>
    </div>
  );
}
