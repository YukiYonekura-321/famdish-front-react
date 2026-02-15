import { useState } from "react";

export default function HamburgerButton({ onToggle, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className={`md:hidden flex flex-col justify-center items-center w-10 h-10 relative z-30 rounded-lg hover:bg-[var(--surface)] transition-colors ${className}`}
        onClick={() => {
          const newOpen = !open;
          setOpen(newOpen);
          if (typeof onToggle === "function") onToggle(newOpen);
        }}
        aria-label="Menu"
      >
        <div className="space-y-1.5">
          <span
            className={`block w-6 h-0.5 rounded-full transition-all duration-300
            ${open ? "rotate-45 translate-y-2" : ""}`}
            style={{ backgroundColor: 'var(--foreground)' }}
          />
          <span
            className={`block w-6 h-0.5 rounded-full transition-all duration-300
            ${open ? "opacity-0" : ""}`}
            style={{ backgroundColor: 'var(--foreground)' }}
          />
          <span
            className={`block w-6 h-0.5 rounded-full transition-all duration-300
            ${open ? "-rotate-45 -translate-y-2" : ""}`}
            style={{ backgroundColor: 'var(--foreground)' }}
          />
        </div>
      </button>
    </div>
  );
}
