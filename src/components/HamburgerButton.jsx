import { useState } from "react";
import Link from "next/link";

export default function HamburgerButton() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative z-30"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <div className="space-y-2">
          <span
            className={`block w-8 h-1 bg-white rounded transition-all duration-300
            ${open ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-8 h-1 bg-white rounded transition-all duration-300
            ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-8 h-1 bg-white rounded transition-all duration-300
            ${open ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </div>
      </button>

      {/* モバイルメニュー */}
      {open && (
        <nav className="md:hidden absolute top-full right-0 left-0 z-20 bg-zinc-900/90 backdrop-blur-sm">
          <ul className="flex flex-col space-y-4 p-4">
            <li>
              <Link
                href="/about"
                className="text-white"
                onClick={() => setOpen(false)}
              >
                FamDishとは
              </Link>
            </li>
            <li>
              <Link
                href="/members"
                className="text-white"
                onClick={() => setOpen(false)}
              >
                新規登録
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
