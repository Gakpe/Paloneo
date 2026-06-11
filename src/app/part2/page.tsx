"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Wall } from "@/components/Wall";

// Placeholders — à remplacer par les vrais liens.
const RESOURCES = [
  {
    title: "La tribune de Julien",
    subtitle: "Building tomorrow's African financing rails",
    href: "#",
  },
  {
    title: "Assessment Model for Africa",
    subtitle: "Gosia Brzezinska · Eastrise Group",
    href: "#",
  },
];

export default function Part2() {
  return (
    <AppShell title="Partie 2 · Build Together">
      <h1 className="mb-1 font-serif text-2xl text-cream">
        How Do We Build Together?
      </h1>
      <p className="mb-4 text-sm text-cream/70">Passons à l&apos;opérationnel.</p>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {RESOURCES.map((r) => (
          <a
            key={r.title}
            href={r.href}
            target="_blank"
            rel="noreferrer"
            className="card flex items-center gap-3 p-3.5 active:scale-[0.99]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ember/15 text-ember">
              ↗
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-cream">
                {r.title}
              </p>
              <p className="truncate text-xs text-cream/50">{r.subtitle}</p>
            </div>
          </a>
        ))}
      </div>

      <Wall
        part={2}
        prompt="À quoi ressemble la renaissance des relations Afrique-Europe selon vous ? Comment passe-t-on à l'opérationnel ?"
      />

      <Link href="/whats-next" className="btn-primary mt-8 w-full text-base">
        Conclure · What&apos;s Next →
      </Link>
    </AppShell>
  );
}
