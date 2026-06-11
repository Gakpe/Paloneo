"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ConfigNotice } from "@/components/ConfigNotice";
import { getSupabase } from "@/lib/supabase";
import { useParticipant } from "@/lib/participant";

const CONTRIB_OPTIONS = [
  { key: "time", label: "Du temps" },
  { key: "expertise", label: "Expertise / Knowledge" },
  { key: "funding", label: "Soutien financier" },
  { key: "network", label: "Mise en réseau" },
  { key: "other", label: "Autre" },
];

export default function WhatsNext() {
  const supabase = getSupabase();
  const { participant } = useParticipant();
  const [wants, setWants] = useState<string>("");
  const [types, setTypes] = useState<string[]>([]);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (key: string) =>
    setTypes((t) => (t.includes(key) ? t.filter((x) => x !== key) : [...t, key]));

  async function submit() {
    if (!wants) {
      setError("Merci de répondre à la première question.");
      return;
    }
    if (!supabase || !participant) {
      setError("Supabase non configuré.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("whats_next").insert({
      participant_id: participant.id,
      wants_to_contribute: wants,
      contribution_types: types,
      expertise_detail: detail.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <AppShell title="Merci">
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-up">
          <div className="text-5xl">🍍</div>
          <h1 className="mt-4 font-serif text-3xl text-cream">Merci !</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/65">
            Votre contribution rejoint la renaissance africaine avec Paloneo.
            Nous reviendrons vers vous avec le bilan de la session.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="What's Next">
      <h1 className="mb-1 font-serif text-2xl text-cream">What&apos;s Next</h1>
      <p className="mb-5 text-sm text-cream/70">Quelques mots pour la suite.</p>

      {!supabase && <ConfigNotice />}

      <div className="space-y-6">
        <div>
          <p className="label">
            Souhaitez-vous contribuer à la renaissance africaine avec Paloneo ?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: "yes", l: "Oui" },
              { k: "maybe", l: "Peut-être" },
              { k: "no", l: "Non" },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => setWants(o.k)}
                className={`min-h-[44px] rounded-xl border text-sm transition ${
                  wants === o.k
                    ? "border-ember bg-ember/15 text-cream"
                    : "border-white/10 bg-night/40 text-cream/75"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label">Sous quelle forme ?</p>
          <div className="flex flex-wrap gap-2">
            {CONTRIB_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => toggle(o.key)}
                className={`min-h-[44px] rounded-full border px-4 text-sm transition ${
                  types.includes(o.key)
                    ? "border-ember bg-ember/15 text-cream"
                    : "border-white/10 bg-night/40 text-cream/75"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Quel type d&apos;expertise ?</label>
          <textarea
            className="field min-h-[88px] resize-none"
            placeholder="Décrivez ce que vous pourriez apporter…"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            maxLength={500}
          />
        </div>

        {error && <p className="text-sm text-ember">{error}</p>}

        <button
          className="btn-primary w-full"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Envoi…" : "Envoyer ma contribution"}
        </button>
      </div>
    </AppShell>
  );
}
