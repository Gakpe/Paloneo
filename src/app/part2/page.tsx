"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Wall } from "@/components/Wall";

type Resource = {
  title: string;
  subtitle: string;
  href?: string;
  live?: boolean;
};

const RESOURCES: Resource[] = [
  {
    title: "Tribune Africa Forward — Minah",
    subtitle: "Read the op-ed · PDF",
    href: "/africa-forward-minah.pdf",
  },
  {
    title: "Assessment Model for Africa",
    subtitle: "Presented live by Gosia · Eastrise Group",
    live: true,
  },
];

export default function Part2() {
  return (
    <AppShell title="Part 2 · Build Together">
      <Link
        href="/part1"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-cream/60 transition active:scale-95 hover:text-ember"
      >
        ← Back to Part 1
      </Link>

      <h1 className="mb-1 font-serif text-2xl text-cream">
        How Do We Build Together?
      </h1>
      <p className="mb-4 text-sm text-cream/70">Let&apos;s get operational.</p>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {RESOURCES.map((r) =>
          r.live ? (
            <div
              key={r.title}
              className="card flex items-center gap-3 p-3.5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ember/15 text-ember">
                ●
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-cream">
                  {r.title}
                </p>
                <p className="truncate text-xs text-cream/50">{r.subtitle}</p>
              </div>
              <span className="shrink-0 rounded-full bg-ember/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ember">
                Live
              </span>
            </div>
          ) : (
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
          )
        )}
      </div>

      <Wall
        part={2}
        prompt="What does the renaissance of Africa–Europe relations look like to you? How do we make it operational?"
      />

      <Link href="/whats-next" className="btn-primary mt-8 w-full text-base">
        Wrap up · What&apos;s Next →
      </Link>
    </AppShell>
  );
}
