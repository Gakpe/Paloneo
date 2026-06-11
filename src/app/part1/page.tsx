"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Wall } from "@/components/Wall";

export default function Part1() {
  return (
    <AppShell title="Partie 1 · Building Trust">
      <h1 className="mb-1 font-serif text-2xl text-cream">Building Trust</h1>
      <p className="mb-4 text-sm text-cream/55">
        Posez les bases de la confiance.
      </p>

      <Wall
        part={1}
        prompt="Qu'est-ce qu'il vous faudrait pour vous impliquer davantage sur les sujets africains ?"
      />

      <Link
        href="/part2"
        className="btn-primary mt-8 w-full text-base"
      >
        Passer à la Partie 2 →
      </Link>
    </AppShell>
  );
}
