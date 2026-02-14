export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative w-16 h-16">
        {/* 回転するスピナー */}
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
        <div
          className="absolute inset-2 border-4 border-transparent border-b-green-500 border-l-green-500 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
      </div>
      <p className="text-center text-gray-600 font-medium">
        提案を生成中です...
      </p>
    </div>
  );
}
