"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { storeParticipant } from "@/lib/participant";
import { FAMILIARITY_LABELS, type Participant } from "@/lib/types";
import { Header } from "@/components/Header";
import { ConfigNotice } from "@/components/ConfigNotice";

export default function Onboarding() {
  const router = useRouter();
  const supabase = getSupabase();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role_org: "",
    expertise: "",
    email: "",
    phone: "",
    africa_familiarity: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid =
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.role_org.trim() &&
    form.expertise.trim() &&
    form.africa_familiarity > 0;

  async function submit() {
    if (!valid) {
      setError("Please fill in the required fields.");
      return;
    }
    if (!supabase) {
      setError("Supabase not configured.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from("participants")
      .insert({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        role_org: form.role_org.trim(),
        expertise: form.expertise.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        africa_familiarity: form.africa_familiarity,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error || !data) {
      setError(error?.message ?? "Something went wrong.");
      return;
    }
    const stored = storeParticipant(data as Participant);
    if (!stored) {
      setError(
        "Couldn't save your session (private browsing?). Turn off private mode and try again."
      );
      return;
    }
    router.push("/part1");
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title="Welcome" />
      <main className="mx-auto max-w-md px-4 py-6">
        <h1 className="font-serif text-2xl text-cream">
          Let&apos;s get to know each other
        </h1>
        <p className="mt-1 text-sm text-cream/60">
          A few details to join the circle.
        </p>

        {!supabase && <ConfigNotice />}

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First name *</label>
              <input
                className="field"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Last name *</label>
              <input
                className="field"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Role / Organization *</label>
            <input
              className="field"
              placeholder="CEO @ Acme Capital"
              value={form.role_org}
              onChange={(e) => set("role_org", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Area of expertise *</label>
            <input
              className="field"
              placeholder="Finance, impact, tech, legal…"
              value={form.expertise}
              onChange={(e) => set("expertise", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email</label>
              <input
                className="field"
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="field"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Your familiarity with Africa *</label>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => set("africa_familiarity", lvl)}
                  className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    form.africa_familiarity === lvl
                      ? "border-ember bg-ember/15 text-cream"
                      : "border-white/10 bg-night/40 text-cream/75"
                  }`}
                >
                  <span className="mr-2 font-semibold text-ember">{lvl}</span>
                  {FAMILIARITY_LABELS[lvl]}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-ember">{error}</p>}

          <button
            className="btn-primary w-full"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "One moment…" : "Enter the circle →"}
          </button>

          <p className="text-xs leading-relaxed text-cream/40">
            Your details will only be used to share the session summary and
            follow up.
          </p>
        </div>
      </main>
    </div>
  );
}
