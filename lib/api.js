// axios: HTTPリクエストを送るためのライブラリ
import axios from "axios";
import { auth } from "./firebase";

// auth.currentUser: 現在ログインしているユーザー。
// getIdToken(): Firebaseが発行するJWT（JSON Web Token）を取得。
// ?: ユーザーが存在する場合のみトークンを取得（Optional chaining）。
export const fetchMenu = async () => {
  const token = await auth.currentUser?.getIdToken();
  // axios.get(...): APIにGETリクエストを送信。
  // headers: 認証情報を含めるため、Authorization ヘッダーに Bearer トークン を設定。
  const res = await axios.get("http://localhost:3000/api/menus", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// この関数 fetchMenu は：
// Firebaseでログインしているユーザーのトークンを取得し、
// そのトークンを使って、保護されたAPI（/api/menus）にアクセスし、メニュー情報を取得して返却。