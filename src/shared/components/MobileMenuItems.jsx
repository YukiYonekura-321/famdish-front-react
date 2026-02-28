import MobileNavLink from "./MobileNavLink";

export default function MobileMenuItems({ onClick }) {
  return (
    <>
      <MobileNavLink href="/" onClick={onClick}>
        FamDishとは
      </MobileNavLink>
      <MobileNavLink href="/sign-in" onClick={onClick}>
        新規登録
      </MobileNavLink>
      <MobileNavLink href="/login" onClick={onClick}>
        ログイン
      </MobileNavLink>
    </>
  );
}
