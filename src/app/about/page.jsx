import { Header } from "../../components/header";
import { Footer } from "../../components/footer";

// LoginPage というReactコンポーネントを定義
// ボタンを表示して、クリックすると login 関数が呼ばれ、Googleログイン開始
export default function AboutPage() {
  return (
    <div>
      <Header />

      <div className="flex flex-col justify-center items-center mt-4 space-y-4">
        <h1 className="text-2xl font-bold">FamDishとは</h1>
        <p>
          献立を考える手間をなくしたい。食べたいものが食卓に出てくると嬉しい。食材の無駄やマンネリ化をなくしたい。そんな願いを叶えます。
        </p>
      </div>

      <Footer />
    </div>
  );
  // return <button onClick={login}>Googleでログイン</button>;
}
