"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/part1", label: "Partie 1", icon: "M3 12h18M3 6h18M3 18h10" },
  { href: "/part2", label: "Partie 2", icon: "M4 7h16M4 12h16M4 17h10" },
  {
    href: "/group",
    label: "Le Groupe",
    icon: "M16 11a4 4 0 10-8 0M3 20a6 6 0 0118 0",
  },
  {
    href: "/connections",
    label: "Connexions",
    icon: "M8 12h8M12 8v8M4 12a8 8 0 1016 0 8 8 0 10-16 0",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-night/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-2xl grid-cols-4">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] transition ${
                active ? "text-ember" : "text-cream/55"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.icon} />
              </svg>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
