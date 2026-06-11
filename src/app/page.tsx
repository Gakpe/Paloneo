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
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="african-weave pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative animate-fade-in">
        <div className="absolute inset-0 -z-10 rounded-full bg-ember/20 blur-2xl" />
        <Pineapple className="mx-auto h-28 w-28 drop-shadow-[0_6px_24px_rgba(227,138,33,0.25)]" />
      </div>

      <h1 className="relative mt-6 font-serif text-4xl leading-tight text-cream animate-fade-up sm:text-5xl">
        Welcome to the
        <br />
        <span className="text-ember">Africa Circle</span>
      </h1>

      <div
        className="kente-band relative mx-auto mt-5 w-28 rounded-full animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      />

      <p
        className="relative mt-4 max-w-sm text-sm leading-relaxed text-cream/65 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Renaissance Summit · Hosted by Minah &amp; Eastrise Group
      </p>

      <div
        className="relative mt-10 w-full max-w-xs animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        {returning ? (
          <button
            className="btn-primary w-full"
            onClick={() => router.push("/part1")}
          >
            Resume session →
          </button>
        ) : (
          <Link href="/onboarding" className="btn-primary w-full">
            Get started
          </Link>
        )}
        {returning && (
          <Link
            href="/onboarding"
            className="mt-3 block text-xs text-cream/40 underline"
          >
            Not you? Start over
          </Link>
        )}
      </div>

      <div className="relative mt-14 flex flex-col items-center gap-4 animate-fade-up">
        <p className="text-[10px] uppercase tracking-[0.25em] text-cream/40">
          Hosted by
        </p>
        <div className="flex items-center justify-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-minah.png"
            alt="Minah"
            className="h-6 w-auto object-contain"
          />
          <span className="h-8 w-px bg-white/15" />
          {/* Eastrise mark is white-on-black; screen blend drops the black bg. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-eastrise.jpg"
            alt="Eastrise"
            className="h-14 w-14 object-contain mix-blend-screen"
          />
        </div>
      </div>

      <p className="relative mt-8 flex items-center gap-1.5 text-xs text-cream/30">
        <Pineapple className="h-4 w-4" /> Paloneo · renaissancesummit.org
      </p>
    </main>
  );
}
