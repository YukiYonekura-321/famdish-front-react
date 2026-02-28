/** メニューリストコンポーネント */
export function MenuList({ member }) {
  if (Array.isArray(member.menus) && member.menus.length > 0) {
    return member.menus.map((menu) => (
      <div key={`menu-${member.id}-${menu.id}`} className="text-base">
        • {menu.name}
      </div>
    ));
  }
  if (member.menu?.name) {
    return <div className="text-base">• {member.menu.name}</div>;
  }
  return <span className="text-muted text-sm">未提案</span>;
}
