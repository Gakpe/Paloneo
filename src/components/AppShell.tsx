"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useParticipant } from "@/lib/participant";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

/**
 * Wraps the in-session screens: sticky header, bottom navbar, and a guard
 * that sends first-time visitors through onboarding.
 */
export function AppShell({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { participant, loading } = useParticipant();

  useEffect(() => {
    if (!loading && !participant) router.replace("/");
  }, [loading, participant, router]);

  if (loading || !participant) {
    return (
      <div className="flex min-h-screen items-center justify-center text-cream/40">
        …
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title={title} />
      <main className="mx-auto max-w-2xl px-4 pt-5 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
