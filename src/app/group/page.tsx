"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfigNotice } from "@/components/ConfigNotice";
import {
  ConnectionModal,
  type ConnectionTarget,
} from "@/components/ConnectionModal";
import { getSupabase } from "@/lib/supabase";
import { useParticipant } from "@/lib/participant";
import { FAMILIARITY_LABELS, type Participant } from "@/lib/types";

export default function Group() {
  const supabase = getSupabase();
  const { participant } = useParticipant();
  const [people, setPeople] = useState<Participant[]>([]);
  const [target, setTarget] = useState<ConnectionTarget | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("participants")
        .select("*")
        .order("created_at", { ascending: true });
      if (active && data) setPeople(data as Participant[]);
    };
    load();
    const channel = supabase
      .channel("participants-group")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        load
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const stats = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const p of people) {
      if (counts[p.africa_familiarity] !== undefined)
        counts[p.africa_familiarity]++;
    }
    return counts;
  }, [people]);

  const total = people.length || 1;

  return (
    <AppShell title="Le Groupe">
      <h1 className="mb-1 font-serif text-2xl text-cream">Le Groupe</h1>
      <p className="mb-4 text-sm text-cream/55">
        {people.length} participant{people.length > 1 ? "s" : ""} dans le cercle.
      </p>

      {!supabase && <ConfigNotice />}

      <div className="card mb-5 p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ember">
          Familiarité avec l&apos;Afrique
        </p>
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((lvl) => {
            const pct = Math.round((stats[lvl] / total) * 100);
            return (
              <div key={lvl}>
                <div className="mb-1 flex items-center justify-between text-xs text-cream/70">
                  <span>{FAMILIARITY_LABELS[lvl]}</span>
                  <span className="text-cream/45">{stats[lvl]}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-ember transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {people.map((p) => {
          const isMine = p.id === participant?.id;
          return (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-cream">
                    {p.first_name} {p.last_name}{" "}
                    {isMine && (
                      <span className="ml-1 rounded bg-ember/20 px-1.5 py-0.5 text-[10px] text-ember">
                        vous
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-cream/55">{p.role_org}</p>
                  {p.expertise && (
                    <p className="mt-1.5 inline-block rounded-full bg-white/5 px-2.5 py-1 text-xs text-cream/70">
                      {p.expertise}
                    </p>
                  )}
                </div>
                {!isMine && participant && (
                  <button
                    onClick={() =>
                      setTarget({ id: p.id, name: p.first_name })
                    }
                    className="btn-ghost shrink-0 !min-h-[40px] px-3 text-xs"
                  >
                    Se connecter
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {target && participant && (
        <ConnectionModal
          fromId={participant.id}
          target={target}
          onClose={(sent) => {
            setTarget(null);
            if (sent) alert("Connexion envoyée ✓");
          }}
        />
      )}
    </AppShell>
  );
}
