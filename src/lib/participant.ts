"use client";

import { useEffect, useState } from "react";
import type { Participant } from "./types";

const ID_KEY = "ac_participant_id";
const CACHE_KEY = "ac_participant";

export function getStoredParticipantId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ID_KEY);
  } catch {
    return null;
  }
}

export function getCachedParticipant(): Participant | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Participant;
  } catch {
    return null;
  }
}

/**
 * Persists the participant. Returns false if storage is unavailable
 * (e.g. Safari private mode throws on setItem) so callers can react.
 */
export function storeParticipant(p: Participant): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(ID_KEY, p.id);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export function clearParticipant() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ID_KEY);
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
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
