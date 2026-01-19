import { useState } from "react";

export default function HamburgerButton({ onToggle, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className={`md:hidden flex flex-col justify-center items-center w-8 h-8 relative z-30 ${className}`}
        onClick={() => {
          const newOpen = !open;
          setOpen(newOpen);
          if (typeof onToggle === "function") onToggle(newOpen);
        }}
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
    </div>
  );
}
