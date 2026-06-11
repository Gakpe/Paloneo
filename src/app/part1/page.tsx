"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Wall } from "@/components/Wall";

export default function Part1() {
  return (
    <AppShell title="Part 1 · Building Trust">
      <h1 className="mb-1 font-serif text-2xl text-cream">Building Trust</h1>
      <p className="mb-4 text-sm text-cream/70">
        Lay the foundations of trust.
      </p>

      <Wall
        part={1}
        prompt="What would you need in order to get more involved in African topics?"
      />

      <div className="african-weave mt-8 overflow-hidden rounded-2xl border border-ember/30 bg-marsala/30 p-5 text-center">
        <p className="font-serif text-lg text-cream">Want to go further?</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-cream/70">
          Reach out to someone or float a project idea — privately. This is how
          the group&apos;s momentum starts.
        </p>
        <Link href="/group" className="btn-ghost mt-4 inline-flex">
          Connect with someone →
        </Link>
      </div>

      <Link
        href="/part2"
        className="btn-primary mt-5 w-full text-base"
      >
        Continue to Part 2 →
      </Link>
    </AppShell>
  );
}
