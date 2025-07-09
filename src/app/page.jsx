// pages/index.tsx
import { fetchMenu } from "../lib/api";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    fetchMenu().then(setMenu);
  }, []);

  return (
    <div>
      <h1>今日の献立</h1>
      {/*<pre>：menu の中身を整形して表示（JSON形式）。*/}
      {/* menu : 変換したいオブジェクト, null: 特定のキーだけを変換したいときに使う（ここでは null → すべてのキーを対象） 2 : インデントのスペース数*/}
      <pre>{JSON.stringify(menu, null, 2)}</pre>
    </div>
  );
}