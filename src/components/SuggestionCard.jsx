export default function SuggestionCard({ suggestion, index, onOk, onRetry }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <h2 className="text-lg font-bold mb-2">🍽️ 献立案 {index + 1}</h2>

      <p>
        <strong>タイトル：</strong>
        {suggestion.title}
      </p>
      <p>
        <strong>理由：</strong>
        {suggestion.reason}
      </p>
      <p>
        <strong>時間：</strong>
        {suggestion.time} 分
      </p>
      <p>
        <strong>材料：</strong>
        {suggestion.ingredients.join(" / ")}
      </p>

      <div className="flex gap-2 mt-4">
        <button
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={onOk}
        >
          👍 OK
        </button>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={onRetry}
        >
          🔄 別案
        </button>
      </div>
    </div>
  );
}
