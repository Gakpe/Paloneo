"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { ConfigNotice } from "@/components/ConfigNotice";
import { Pineapple } from "@/components/Pineapple";
import {
  FAMILIARITY_LABELS,
  INTENT_LABELS,
  type Connection,
  type Participant,
  type Post,
  type WhatsNext,
} from "@/lib/types";

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || "minah2026";
const OK_KEY = "ac_admin_ok";

type TabKey = "participants" | "posts" | "connections" | "whats_next";
const TABS: { key: TabKey; label: string }[] = [
  { key: "participants", label: "Participants" },
  { key: "posts", label: "Posts" },
  { key: "connections", label: "Connections" },
  { key: "whats_next", label: "What's Next" },
];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(OK_KEY) === "1")
      setAuthed(true);
  }, []);

  function tryUnlock() {
    if (code.trim() === ADMIN_CODE) {
      localStorage.setItem(OK_KEY, "1");
      setAuthed(true);
    } else {
      setCodeError(true);
    }
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Pineapple className="h-12 w-12" />
        <h1 className="mt-5 font-serif text-2xl text-cream">Admin</h1>
        <p className="mt-1 text-sm text-cream/55">Enter the access code.</p>
        <input
          className="field mt-5 max-w-xs text-center"
          type="password"
          value={code}
          autoFocus
          onChange={(e) => {
            setCode(e.target.value);
            setCodeError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
          placeholder="Access code"
        />
        {codeError && (
          <p className="mt-2 text-sm text-ember">Wrong code.</p>
        )}
        <button className="btn-primary mt-4 w-full max-w-xs" onClick={tryUnlock}>
          Unlock
        </button>
        <Link href="/" className="mt-6 text-xs text-cream/40 underline">
          ← Back to app
        </Link>
      </main>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const supabase = getSupabase();
  const [tab, setTab] = useState<TabKey>("participants");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [whatsNext, setWhatsNext] = useState<WhatsNext[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [p, po, c, w] = await Promise.all([
      supabase.from("participants").select("*").order("created_at", { ascending: false }),
      supabase.from("posts").select("*").order("created_at", { ascending: false }),
      supabase.from("connections").select("*").order("created_at", { ascending: false }),
      supabase.from("whats_next").select("*").order("created_at", { ascending: false }),
    ]);
    if (p.data) setParticipants(p.data as Participant[]);
    if (po.data) setPosts(po.data as Post[]);
    if (c.data) setConnections(c.data as Connection[]);
    if (w.data) setWhatsNext(w.data as WhatsNext[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
    if (!supabase) return;
    const ch = supabase
      .channel("admin-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "whats_next" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, load]);

  const nameOf = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of participants) map[p.id] = `${p.first_name} ${p.last_name}`;
    return map;
  }, [participants]);

  async function deleteRow(table: TabKey, id: string) {
    if (!supabase) return;
    if (!confirm("Delete this row? This cannot be undone.")) return;
    setBusy(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setBusy(false);
    if (error) alert(error.message);
    else load();
  }

  async function updateRow(
    table: TabKey,
    id: string,
    patch: Record<string, unknown>
  ) {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.from(table).update(patch).eq("id", id);
    setBusy(false);
    if (error) alert(error.message);
    else load();
  }

  async function clearTable(table: TabKey) {
    if (!supabase) return;
    if (!confirm(`Empty the entire "${table}" table? This cannot be undone.`))
      return;
    setBusy(true);
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    setBusy(false);
    if (error) alert(error.message);
    else load();
  }

  async function resetEverything() {
    if (!supabase) return;
    if (
      !confirm(
        "RESET EVERYTHING — delete all participants, posts, connections and What's Next answers?"
      )
    )
      return;
    if (!confirm("Are you absolutely sure? Final confirmation.")) return;
    setBusy(true);
    // children first, then participants
    for (const t of ["posts", "connections", "whats_next", "participants"] as TabKey[]) {
      const { error } = await supabase.from(t).delete().not("id", "is", null);
      if (error) {
        setBusy(false);
        alert(`${t}: ${error.message}`);
        return;
      }
    }
    setBusy(false);
    load();
  }

  const counts = {
    participants: participants.length,
    posts: posts.length,
    connections: connections.length,
    whats_next: whatsNext.length,
  };

  const familiarity = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const p of participants)
      if (c[p.africa_familiarity] !== undefined) c[p.africa_familiarity]++;
    return c;
  }, [participants]);

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/85 backdrop-blur-md pt-[env(safe-area-inset-top)]">
        <div className="kente-band" />
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <Pineapple className="h-6 w-6" />
            <span className="font-serif text-lg text-cream">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={busy}
              className="btn-ghost !min-h-[38px] px-3 text-xs"
            >
              ↻ Refresh
            </button>
            <Link href="/" className="btn-ghost !min-h-[38px] px-3 text-xs">
              App
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {!supabase && <ConfigNotice />}

        {/* Counts */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`card p-3 text-left transition ${
                tab === t.key ? "border-ember/60 bg-ember/10" : ""
              }`}
            >
              <p className="text-2xl font-semibold text-cream">
                {counts[t.key]}
              </p>
              <p className="text-xs text-cream/55">{t.label}</p>
            </button>
          ))}
        </div>

        {/* Familiarity snapshot */}
        <div className="card mt-3 p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ember">
            Familiarity with Africa
          </p>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((lvl) => {
              const pct = Math.round(
                (familiarity[lvl] / (participants.length || 1)) * 100
              );
              return (
                <div key={lvl}>
                  <div className="mb-1 flex justify-between text-xs text-cream/70">
                    <span>{FAMILIARITY_LABELS[lvl]}</span>
                    <span className="text-cream/45">{familiarity[lvl]}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-ember"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                tab === t.key
                  ? "border-ember bg-ember/15 text-cream"
                  : "border-white/10 bg-night/40 text-cream/70"
              }`}
            >
              {t.label} ({counts[t.key]})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-cream/40">Loading…</p>
        ) : (
          <div className="mt-4 space-y-2.5">
            {tab === "participants" &&
              participants.map((p) => (
                <Row
                  key={p.id}
                  onDelete={() => deleteRow("participants", p.id)}
                  onEdit={() => {
                    const role = prompt("Role / Organization:", p.role_org);
                    if (role === null) return;
                    const exp = prompt("Area of expertise:", p.expertise);
                    if (exp === null) return;
                    updateRow("participants", p.id, {
                      role_org: role.trim(),
                      expertise: exp.trim(),
                    });
                  }}
                >
                  <p className="font-medium text-cream">
                    {p.first_name} {p.last_name}
                    <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-cream/60">
                      lvl {p.africa_familiarity}
                    </span>
                  </p>
                  <p className="text-xs text-cream/55">{p.role_org}</p>
                  <p className="text-xs text-cream/45">{p.expertise}</p>
                  {(p.email || p.phone) && (
                    <p className="mt-1 text-xs text-ember/80">
                      {[p.email, p.phone].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </Row>
              ))}

            {tab === "posts" &&
              posts.map((po) => (
                <Row
                  key={po.id}
                  onDelete={() => deleteRow("posts", po.id)}
                  onEdit={() => {
                    const v = prompt("Edit post content:", po.content);
                    if (v !== null) updateRow("posts", po.id, { content: v });
                  }}
                >
                  <p className="text-[11px] text-cream/45">
                    Part {po.part} · {nameOf[po.participant_id] ?? "—"} · ♥{" "}
                    {po.likes}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-cream/90">
                    {po.content}
                  </p>
                </Row>
              ))}

            {tab === "connections" &&
              connections.map((c) => (
                <Row
                  key={c.id}
                  onDelete={() => deleteRow("connections", c.id)}
                >
                  <p className="text-sm text-cream/90">
                    {nameOf[c.from_participant] ?? "—"}{" "}
                    <span className="text-cream/40">→</span>{" "}
                    {nameOf[c.to_participant] ?? "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-ember/80">
                    {INTENT_LABELS[c.intent] ?? c.intent}
                  </p>
                  {c.message && (
                    <p className="mt-1 text-xs italic text-cream/60">
                      “{c.message}”
                    </p>
                  )}
                </Row>
              ))}

            {tab === "whats_next" &&
              whatsNext.map((w) => (
                <Row
                  key={w.id}
                  onDelete={() => deleteRow("whats_next", w.id)}
                >
                  <p className="text-sm text-cream/90">
                    {nameOf[w.participant_id] ?? "—"} —{" "}
                    <span className="text-ember">{w.wants_to_contribute}</span>
                  </p>
                  {w.contribution_types?.length > 0 && (
                    <p className="mt-0.5 text-xs text-cream/55">
                      {w.contribution_types.join(", ")}
                    </p>
                  )}
                  {w.expertise_detail && (
                    <p className="mt-1 text-xs italic text-cream/60">
                      “{w.expertise_detail}”
                    </p>
                  )}
                </Row>
              ))}

            {counts[tab] === 0 && (
              <p className="py-12 text-center text-sm text-cream/40">
                No rows.
              </p>
            )}
          </div>
        )}

        {/* Danger zone */}
        <div className="mt-10 rounded-2xl border border-ember/30 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ember">
            Danger zone
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => clearTable(tab)}
              disabled={busy}
              className="rounded-full border border-ember/50 px-4 py-2 text-sm text-ember active:scale-95 disabled:opacity-50"
            >
              Empty “{TABS.find((t) => t.key === tab)?.label}” table
            </button>
            <button
              onClick={resetEverything}
              disabled={busy}
              className="rounded-full bg-ember/90 px-4 py-2 text-sm font-semibold text-night active:scale-95 disabled:opacity-50"
            >
              Reset everything
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({
  children,
  onEdit,
  onDelete,
}: {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card flex items-start justify-between gap-3 p-3.5">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex shrink-0 flex-col gap-1.5">
        {onEdit && (
          <button
            onClick={onEdit}
            className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-cream/80 active:scale-95"
          >
            Edit
          </button>
        )}
        <button
          onClick={onDelete}
          className="rounded-lg border border-ember/40 px-2.5 py-1 text-xs text-ember active:scale-95"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
