"use client";

import { useEffect, useState } from "react";
import type { Participant } from "./types";

const ID_KEY = "ac_participant_id";
const CACHE_KEY = "ac_participant";

export function getStoredParticipantId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ID_KEY);
}

export function getCachedParticipant(): Participant | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Participant;
  } catch {
    return null;
  }
}

export function storeParticipant(p: Participant) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ID_KEY, p.id);
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(p));
}

export function clearParticipant() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ID_KEY);
  window.localStorage.removeItem(CACHE_KEY);
}

/**
 * Client hook to read the current participant from localStorage.
 * `loading` stays true until we've checked (avoids SSR/client mismatch).
 */
export function useParticipant() {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setParticipant(getCachedParticipant());
    setLoading(false);
  }, []);

  return { participant, loading };
}
