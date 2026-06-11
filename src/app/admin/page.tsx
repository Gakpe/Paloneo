"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { ConfigNotice } from "@/components/ConfigNotice";

/* ------------------------------------------------------------------ *
 * Admin console — read the live Supabase tables and edit/delete rows. *
 * Gated by a passcode (the anon key has open RLS, so this protects    *
 * against casual access only; change ADMIN_PASSCODE below).           *
 * ------------------------------------------------------------------ */

const ADMIN_PASSCODE = "renaissance";
const UNLOCK_KEY = "ac_admin_unlocked";

type FieldType = "text" | "textarea" | "number" | "array";

type Field = {
  key: string;
  label: string;
  type: FieldType;
  /** non-editable (shown read-only): id, created_at, foreign keys */
  readOnly?: boolean;
};

type TableDef = {
  name: string;
  label: string;
  /** column used to order rows (newest first) */
  orderBy: string;
  fields: Field[];
};

const TABLES: TableDef[] = [
  {
    name: "participants",
    label: "Participants",
    orderBy: "created_at",
    fields: [
      { key: "id", label: "ID", type: "text", readOnly: true },
      { key: "first_name", label: "First name", type: "text" },
      { key: "last_name", label: "Last name", type: "text" },
      { key: "role_org", label: "Role / Org", type: "text" },
      { key: "expertise", label: "Expertise", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "africa_familiarity", label: "Familiarity (1–4)", type: "number" },
      { key: "created_at", label: "Created", type: "text", readOnly: true },
    ],
  },
  {
    name: "posts",
    label: "Posts",
    orderBy: "created_at",
    fields: [
      { key: "id", label: "ID", type: "text", readOnly: true },
      { key: "participant_id", label: "Author ID", type: "text", readOnly: true },
      { key: "part", label: "Part (1 or 2)", type: "number" },
      { key: "content", label: "Content", type: "textarea" },
      { key: "likes", label: "Likes", type: "number" },
      { key: "created_at", label: "Created", type: "text", readOnly: true },
    ],
  },
  {
    name: "connections",
    label: "Connections",
    orderBy: "created_at",
    fields: [
      { key: "id", label: "ID", type: "text", readOnly: true },
      { key: "from_participant", label: "From ID", type: "text", readOnly: true },
      { key: "to_participant", label: "To ID", type: "text", readOnly: true },
      { key: "intent", label: "Intent", type: "text" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "created_at", label: "Created", type: "text", readOnly: true },
    ],
  },
  {
    name: "whats_next",
    label: "What's Next",
    orderBy: "created_at",
    fields: [
      { key: "id", label: "ID", type: "text", readOnly: true },
      { key: "participant_id", label: "Participant ID", type: "text", readOnly: true },
      { key: "wants_to_contribute", label: "Wants to contribute", type: "text" },
      { key: "contribution_types", label: "Contribution types", type: "array" },
      { key: "expertise_detail", label: "Expertise detail", type: "textarea" },
      { key: "created_at", label: "Created", type: "text", readOnly: true },
    ],
  },
];

type Row = Record<string, unknown>;

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem(UNLOCK_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  if (!unlocked) {
    return <Gate onUnlock={() => setUnlocked(true)} />;
  }
  return <Console />;
}

/* ---------------------------------- Gate --------------------------------- */

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function submit() {
    if (code === ADMIN_PASSCODE) {
      try {
        sessionStorage.setItem(UNLOCK_KEY, "1");
      } catch {
        /* ignore */
      }
      onUnlock();
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-6">
        <h1 className="font-serif text-2xl text-cream">Admin</h1>
        <p className="mt-1 text-sm text-cream/60">Enter the passcode to continue.</p>
        <input
          type="password"
          autoFocus
          className="field mt-4"
          placeholder="Passcode"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {error && <p className="mt-2 text-sm text-ember">Wrong passcode.</p>}
        <button className="btn-primary mt-4 w-full" onClick={submit}>
          Unlock
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- Console -------------------------------- */

function Console() {
  const supabase = getSupabase();
  const [active, setActive] = useState(TABLES[0].name);
  const [rows, setRows] = useState<Record<string, Row[]>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const def = useMemo(
    () => TABLES.find((t) => t.name === active)!,
    [active]
  );

  const loadTable = useCallback(
    async (name: string) => {
      if (!supabase) return;
      const tdef = TABLES.find((t) => t.name === name)!;
      setLoading(true);
      const { data, error } = await supabase
        .from(name)
        .select("*")
        .order(tdef.orderBy, { ascending: false });
      setLoading(false);
      if (error) {
        setNotice(`Load error: ${error.message}`);
        return;
      }
      setRows((prev) => ({ ...prev, [name]: (data as Row[]) || [] }));
    },
    [supabase]
  );

  const loadCounts = useCallback(async () => {
    if (!supabase) return;
    const entries = await Promise.all(
      TABLES.map(async (t) => {
        const { count } = await supabase
          .from(t.name)
          .select("*", { count: "exact", head: true });
        return [t.name, count ?? 0] as const;
      })
    );
    setCounts(Object.fromEntries(entries));
  }, [supabase]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    loadTable(active);
  }, [active, loadTable]);

  async function remove(row: Row) {
    if (!supabase) return;
    if (!confirm("Delete this row permanently? This cannot be undone.")) return;
    const { error } = await supabase.from(active).delete().eq("id", row.id);
    if (error) {
      setNotice(`Delete error: ${error.message}`);
      return;
    }
    setNotice("Row deleted.");
    loadTable(active);
    loadCounts();
  }

  async function save(updated: Row) {
    if (!supabase) return;
    const patch: Row = {};
    for (const f of def.fields) {
      if (f.readOnly) continue;
      patch[f.key] = updated[f.key];
    }
    const { error } = await supabase.from(active).update(patch).eq("id", updated.id);
    if (error) {
      setNotice(`Save error: ${error.message}`);
      return;
    }
    setNotice("Row saved.");
    setEditing(null);
    loadTable(active);
  }

  if (!supabase) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ConfigNotice />
      </div>
    );
  }

  const currentRows = rows[active] || [];

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-night/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-serif text-xl text-cream">Admin console</h1>
            <p className="text-xs text-cream/50">Live Supabase data</p>
          </div>
          <button
            className="btn-ghost"
            onClick={() => {
              loadTable(active);
              loadCounts();
            }}
          >
            ↻ Refresh
          </button>
        </div>
        <div className="kente-band" />
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TABLES.map((t) => (
            <button
              key={t.name}
              onClick={() => setActive(t.name)}
              className={`card p-4 text-left transition ${
                active === t.name ? "border-ember/60 bg-ember/10" : ""
              }`}
            >
              <p className="text-2xl font-semibold text-cream">
                {counts[t.name] ?? "—"}
              </p>
              <p className="text-xs text-cream/60">{t.label}</p>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-7 mb-3 flex items-center gap-3">
          <h2 className="font-serif text-lg text-cream">{def.label}</h2>
          <span className="rounded-full bg-ember/15 px-2.5 py-0.5 text-xs font-medium text-ember">
            {currentRows.length}
          </span>
          {loading && <span className="text-xs text-cream/40">loading…</span>}
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-3">
          {currentRows.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-cream/40">No rows.</p>
          )}
          {currentRows.map((row) => (
            <article key={String(row.id)} className="card p-4">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                {def.fields.map((f) => (
                  <div key={f.key} className="flex gap-2 text-sm">
                    <dt className="shrink-0 text-cream/45">{f.label}:</dt>
                    <dd className="min-w-0 break-words text-cream/90">
                      {formatValue(row[f.key])}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex gap-2">
                <button
                  className="btn-ghost h-9 min-h-0 px-4 text-xs"
                  onClick={() => setEditing(row)}
                >
                  Edit
                </button>
                <button
                  className="inline-flex h-9 items-center rounded-full border border-red-500/40 px-4 text-xs text-red-300 transition active:scale-95"
                  onClick={() => remove(row)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {editing && (
        <EditModal
          def={def}
          row={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}

      {notice && (
        <div
          className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-marsala px-5 py-2.5 text-sm text-cream shadow-lg"
          onAnimationEnd={() => undefined}
        >
          {notice}
          <button
            className="ml-3 text-cream/50"
            onClick={() => setNotice(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Edit modal ------------------------------ */

function EditModal({
  def,
  row,
  onClose,
  onSave,
}: {
  def: TableDef;
  row: Row;
  onClose: () => void;
  onSave: (row: Row) => void;
}) {
  const [draft, setDraft] = useState<Row>({ ...row });

  function update(field: Field, raw: string) {
    let value: unknown = raw;
    if (field.type === "number") value = raw === "" ? null : Number(raw);
    else if (field.type === "array")
      value = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    else if (raw === "") value = null;
    setDraft((prev) => ({ ...prev, [field.key]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-b-none p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg text-cream">Edit {def.label} row</h3>
          <button className="text-cream/50" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {def.fields.map((f) => {
            const current = draft[f.key];
            const display =
              f.type === "array"
                ? Array.isArray(current)
                  ? (current as string[]).join(", ")
                  : ""
                : current == null
                ? ""
                : String(current);
            return (
              <div key={f.key}>
                <label className="label">
                  {f.label}
                  {f.readOnly && (
                    <span className="ml-2 text-xs text-cream/30">read-only</span>
                  )}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    className="field min-h-[80px] resize-y"
                    value={display}
                    disabled={f.readOnly}
                    onChange={(e) => update(f, e.target.value)}
                  />
                ) : (
                  <input
                    className="field"
                    type={f.type === "number" ? "number" : "text"}
                    value={display}
                    disabled={f.readOnly}
                    onChange={(e) => update(f, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          <button className="btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary flex-1" onClick={() => onSave(draft)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- helpers -------------------------------- */

function formatValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  }
  return String(value);
}
