"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfigNotice } from "@/components/ConfigNotice";
import { getSupabase } from "@/lib/supabase";
import { useParticipant } from "@/lib/participant";
import {
  INTENT_LABELS,
  type Connection,
  type Participant,
} from "@/lib/types";

type Tab = "received" | "sent";

export default function Connections() {
  const supabase = getSupabase();
  const { participant } = useParticipant();
  const [tab, setTab] = useState<Tab>("received");
  const [received, setReceived] = useState<Connection[]>([]);
  const [sent, setSent] = useState<Connection[]>([]);
  const [people, setPeople] = useState<Record<string, Participant>>({});

  useEffect(() => {
    if (!supabase || !participant) return;
    let active = true;
    const load = async () => {
      const [pplRes, recRes, sntRes] = await Promise.all([
        supabase.from("participants").select("*"),
        supabase
          .from("connections")
          .select("*")
          .eq("to_participant", participant.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("connections")
          .select("*")
          .eq("from_participant", participant.id)
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (pplRes.error) console.error("Load participants:", pplRes.error);
      if (recRes.error) console.error("Load received:", recRes.error);
      if (sntRes.error) console.error("Load sent:", sntRes.error);
      if (pplRes.data) {
        const map: Record<string, Participant> = {};
        for (const p of pplRes.data as Participant[]) map[p.id] = p;
        setPeople(map);
      }
      if (recRes.data) setReceived(recRes.data as Connection[]);
      if (sntRes.data) setSent(sntRes.data as Connection[]);
    };
    load();
    // Realtime postgres_changes filters take a single condition (no OR), so we
    // register two filtered listeners — only this participant's connections
    // trigger a reload, avoiding a refetch storm across the whole event.
    const channel = supabase
      .channel(`connections-${participant.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connections",
          filter: `to_participant=eq.${participant.id}`,
        },
        load
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connections",
          filter: `from_participant=eq.${participant.id}`,
        },
        load
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Realtime (connections) subscription:", status);
        }
      });
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, participant]);

  const list = tab === "received" ? received : sent;

  return (
    <AppShell title="Mes connexions">
      <h1 className="mb-1 font-serif text-2xl text-cream">Mes connexions</h1>
      <p className="mb-4 text-sm text-cream/70">
        Vos échanges privés avec le cercle.
      </p>

      {!supabase && <ConfigNotice />}

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-white/10 p-1">
        <button
          onClick={() => setTab("received")}
          className={`min-h-[44px] rounded-full text-sm font-medium transition ${
            tab === "received" ? "bg-ember text-night" : "bg-night/40 text-cream/70"
          }`}
        >
          Reçues ({received.length})
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`min-h-[44px] rounded-full text-sm font-medium transition ${
            tab === "sent" ? "bg-ember text-night" : "bg-night/40 text-cream/70"
          }`}
        >
          Envoyées ({sent.length})
        </button>
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-cream/40">
            {tab === "received"
              ? "Aucune connexion reçue pour l'instant."
              : "Vous n'avez pas encore envoyé de connexion."}
          </p>
        )}
        {list.map((c) => {
          const otherId =
            tab === "received" ? c.from_participant : c.to_participant;
          const other = people[otherId];
          const showContact = tab === "received"; // you see who reached out to you
          return (
            <div key={c.id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-cream">
                  {other
                    ? `${other.first_name} ${other.last_name}`
                    : "Participant"}
                </p>
                <span className="rounded-full bg-ember/15 px-2.5 py-1 text-[11px] text-ember">
                  {INTENT_LABELS[c.intent] ?? c.intent}
                </span>
              </div>
              {other?.role_org && (
                <p className="text-xs text-cream/50">{other.role_org}</p>
              )}
              {c.message && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-cream/85">
                  “{c.message}”
                </p>
              )}
              {showContact && other && (other.email || other.phone) && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3 text-xs">
                  {other.email && (
                    <a
                      href={`mailto:${other.email}`}
                      className="rounded-full bg-white/5 px-3 py-1.5 text-cream/80"
                    >
                      ✉ {other.email}
                    </a>
                  )}
                  {other.phone && (
                    <a
                      href={`tel:${other.phone}`}
                      className="rounded-full bg-white/5 px-3 py-1.5 text-cream/80"
                    >
                      ☎ {other.phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
