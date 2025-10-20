// // axios: HTTPリクエストを送るためのライブラリ
// import axios from "axios";
// import { auth } from "./firebase";

// auth.currentUser: 現在ログインしているユーザー。
// getIdToken(): Firebaseが発行するJWT（JSON Web Token）を取得。
// ?: ユーザーが存在する場合のみトークンを取得（Optional chaining）。
// export const fetchMenu = async () => {
//   const token = await auth.currentUser?.getIdToken();
//   console.log("token:", token);
//   // axios.get(...): APIにGETリクエストを送信。
//   // headers: 認証情報を含めるため、Authorization ヘッダーに Bearer トークン を設定。
//   const res = await axios.get("http://localhost:3001/api/menus", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data;
// };

import axios from "axios";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export const fetchMenu = async () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("未ログインです");
        console.log(user);
        reject(new Error("未ログインです"));
        return;
      }

      try {
        const token = await user.getIdToken(); // 引数の`true`を消すと解決
        console.log("取得したトークン:", token); // ← ここで確認
        const res = await axios.get("http://localhost:3001/api/menus", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json", // ← これを必ず追加！
          },
        });
        resolve(res.data);
      } catch (err) {
        console.error("API呼び出しエラー:", err);
        reject(err);
      }
    });
  });
};
