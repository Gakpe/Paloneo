export type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  role_org: string;
  expertise: string;
  email: string | null;
  phone: string | null;
  africa_familiarity: number; // 1..4
  created_at: string;
};

export type Post = {
  id: string;
  participant_id: string;
  part: number; // 1 or 2
  content: string;
  likes: number;
  created_at: string;
  // joined / denormalized author info (optional)
  author_name?: string;
  author_role?: string;
};

export type ConnectionIntent = "talk_after" | "collab_idea";

export type Connection = {
  id: string;
  from_participant: string;
  to_participant: string;
  intent: ConnectionIntent | string;
  message: string | null;
  created_at: string;
};

export type WhatsNext = {
  id: string;
  participant_id: string;
  wants_to_contribute: string; // 'yes' | 'no' | 'maybe'
  contribution_types: string[];
  expertise_detail: string | null;
  created_at: string;
};

export const FAMILIARITY_LABELS: Record<number, string> = {
  1: "Jamais travaillé avec l'Afrique",
  2: "Curieux · exploratoire",
  3: "Déjà actif sur le continent",
  4: "Très expérimenté",
};

export const INTENT_LABELS: Record<string, string> = {
  talk_after: "J'aimerais en parler avec toi après",
  collab_idea: "J'ai une idée de collaboration",
};
