import { Header } from "../../components/header";

// LoginPage というReactコンポーネントを定義
// ボタンを表示して、クリックすると login 関数が呼ばれ、Googleログイン開始
export default function AboutPage() {
  return (
    <div>
      <Header />

      <div className="min-h-screen flex flex-col justify-center items-center bg-cyan-400">
        <h1 className="text-white text-3xl md:text-6xl font-bold tracking-widest drop-shadow-lg">
          FamDishとは
        </h1>

        <p className="text-white inline-block w-1/2 text-center drop-shadow-lg">
          献立を考える手間をなくしたい。食べたいものが食卓に出てくると嬉しい。食材の無駄やマンネリ化をなくしたい。
        </p>

        <p className="text-white inline-block w-1/2 text-center drop-shadow-lg">
          そんな願いを叶えます。
        </p>
      </div>
    </div>
  );
}
