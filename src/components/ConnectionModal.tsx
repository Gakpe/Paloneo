"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { INTENT_LABELS, type ConnectionIntent } from "@/lib/types";

export type ConnectionTarget = { id: string; name: string };

export function ConnectionModal({
  fromId,
  target,
  onClose,
}: {
  fromId: string;
  target: ConnectionTarget;
  onClose: (sent: boolean) => void;
}) {
  const [intent, setIntent] = useState<ConnectionIntent>("talk_after");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (sending) return; // guard against a double-tap on slow networks
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase not configured.");
      return;
    }
    setSending(true);
    setError(null);
    const { error } = await supabase.from("connections").insert({
      from_participant: fromId,
      to_participant: target.id,
      intent,
      message: message.trim() || null,
    });
    setSending(false);
    if (error) {
      setError(error.message);
      return;
    }
    onClose(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center"
      onClick={() => onClose(false)}
    >
      <div
        className="card w-full max-w-md p-5 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-serif text-xl text-cream">
          Connect with {target.name}
        </p>
        <p className="mt-1 text-sm text-cream/60">
          Private message — visible only to the two of you.
        </p>

        <div className="mt-4 space-y-2">
          {(Object.keys(INTENT_LABELS) as ConnectionIntent[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setIntent(key)}
              className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                intent === key
                  ? "border-ember bg-ember/15 text-cream"
                  : "border-white/10 bg-night/40 text-cream/75"
              }`}
            >
              {INTENT_LABELS[key]}
            </button>
          ))}
        </div>

        <textarea
          className="field mt-3 min-h-[88px] resize-none"
          placeholder="A note (optional)…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={400}
        />

        {error && <p className="mt-2 text-sm text-ember">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="btn-ghost flex-1"
            onClick={() => onClose(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={send}
            disabled={sending}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
