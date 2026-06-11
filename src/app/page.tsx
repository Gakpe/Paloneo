"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredParticipantId } from "@/lib/participant";
import { Pineapple } from "@/components/Pineapple";

export default function Landing() {
  const router = useRouter();
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (getStoredParticipantId()) setReturning(true);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-in">
        <Pineapple className="mx-auto h-14 w-14" />
      </div>

      <h1 className="mt-6 font-serif text-4xl leading-tight text-cream animate-fade-up sm:text-5xl">
        Welcome to the
        <br />
        <span className="text-ember">Africa Circle</span>
      </h1>

      <p
        className="mt-4 max-w-sm text-sm leading-relaxed text-cream/65 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Renaissance Summit · Hosted by Minah &amp; Eastrise Group
      </p>

      <div
        className="mt-10 w-full max-w-xs animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        {returning ? (
          <button
            className="btn-primary w-full"
            onClick={() => router.push("/part1")}
          >
            Reprendre la session →
          </button>
        ) : (
          <Link href="/onboarding" className="btn-primary w-full">
            Commencer
          </Link>
        )}
        {returning && (
          <Link
            href="/onboarding"
            className="mt-3 block text-xs text-cream/40 underline"
          >
            Ce n&apos;est pas vous ? Recommencer
          </Link>
        )}
      </div>

      <p className="mt-16 flex items-center gap-1.5 text-xs text-cream/30">
        <span>🍍</span> Paloneo · renaissancesummit.org
      </p>
    </main>
  );
}
