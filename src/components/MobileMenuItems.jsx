import MobileNavLink from "./MobileNavLink";

export default function MobileMenuItems({ onClick }) {
  return (
    <>
      <MobileNavLink href="/about" onClick={onClick}>
        FamDishとは
      </MobileNavLink>
      <MobileNavLink href="/members" onClick={onClick}>
        新規登録
      </MobileNavLink>
    </>
  );
}
