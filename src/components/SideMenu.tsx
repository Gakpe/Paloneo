"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  {
    href: "/group",
    label: "The Group",
    desc: "Participants & familiarity stats",
    icon: "M16 11a4 4 0 10-8 0M3 20a6 6 0 0118 0",
  },
  {
    href: "/connections",
    label: "My Connections",
    desc: "Your private exchanges",
    icon: "M8 12h8M12 8v8M4 12a8 8 0 1016 0 8 8 0 10-16 0",
  },
];

/**
 * Side drawer (top-right of the header) holding the reference/social screens —
 * The Group and My Connections — so the bottom nav stays focused on the live
 * session flow.
 */
export function SideMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-cream/80 active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 flex h-full w-[80%] max-w-xs flex-col bg-night/95 pt-[env(safe-area-inset-top)] shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="kente-band" />
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-serif text-lg text-cream">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-cream/60 active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2 px-4">
              {LINKS.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                      active
                        ? "border-ember bg-ember/15"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ember/15 text-ember">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={l.icon} />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-cream">{l.label}</p>
                      <p className="text-xs text-cream/55">{l.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
