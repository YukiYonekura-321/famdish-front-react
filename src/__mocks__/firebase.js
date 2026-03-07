// Firebase モック
export const auth = {
  currentUser: { getIdToken: jest.fn(() => Promise.resolve("mock-token")) },
};

export const onAuthStateChanged = jest.fn((_, cb) => {
  // デフォルトで認証済みユーザーを返す
  cb({ uid: "test-uid", getIdToken: () => Promise.resolve("mock-token") });
  return jest.fn(); // unsubscribe
});

export default { auth };
