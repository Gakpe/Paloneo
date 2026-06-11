"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useParticipant } from "@/lib/participant";
import type { Participant, Post } from "@/lib/types";
import { ConfigNotice } from "./ConfigNotice";
import { ConnectionModal, type ConnectionTarget } from "./ConnectionModal";

const LIKES_KEY = "ac_liked_posts";

function getLiked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function setLiked(set: Set<string>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...set]));
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  return `il y a ${h} h`;
}

export function Wall({ part, prompt }: { part: number; prompt: string }) {
  const { participant } = useParticipant();
  const supabase = getSupabase();
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Record<string, Participant>>({});
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [liked, setLikedState] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState<ConnectionTarget | null>(null);

  useEffect(() => setLikedState(getLiked()), []);

  const loadAuthors = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("participants").select("*");
    if (data) {
      const map: Record<string, Participant> = {};
      for (const p of data as Participant[]) map[p.id] = p;
      setAuthors(map);
    }
  }, [supabase]);

  const loadPosts = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("part", part)
      .order("created_at", { ascending: false });
    if (data) setPosts(data as Post[]);
  }, [supabase, part]);

  useEffect(() => {
    loadAuthors();
    loadPosts();
    if (!supabase) return;
    const channel = supabase
      .channel(`posts-part-${part}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts", filter: `part=eq.${part}` },
        () => loadPosts()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, part, loadPosts, loadAuthors]);

  async function submit() {
    if (!supabase || !participant || !content.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      participant_id: participant.id,
      part,
      content: content.trim(),
      likes: 0,
    });
    setPosting(false);
    if (!error) {
      setContent("");
      loadPosts();
    }
  }

  async function like(post: Post) {
    if (!supabase || liked.has(post.id)) return;
    const next = new Set(liked).add(post.id);
    setLikedState(next);
    setLiked(next);
    // optimistic
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes: p.likes + 1 } : p))
    );
    await supabase
      .from("posts")
      .update({ likes: post.likes + 1 })
      .eq("id", post.id);
  }

  if (!supabase) {
    return (
      <div>
        <PromptBox prompt={prompt} />
        <ConfigNotice />
      </div>
    );
  }

  return (
    <div>
      <PromptBox prompt={prompt} />

      <div className="card mt-4 p-3">
        <textarea
          className="field min-h-[80px] resize-none border-0 bg-transparent px-1 focus:ring-0"
          placeholder="Partagez une idée, une question, une information…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={600}
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-cream/35">{content.length}/600</span>
          <button
            className="btn-primary"
            onClick={submit}
            disabled={posting || !content.trim()}
          >
            {posting ? "Envoi…" : "Publier"}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {posts.length === 0 && (
          <p className="py-8 text-center text-sm text-cream/40">
            Soyez le premier à contribuer ✨
          </p>
        )}
        {posts.map((post) => {
          const author = authors[post.participant_id];
          const isMine = participant?.id === post.participant_id;
          return (
            <article key={post.id} className="card p-4 animate-fade-up">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-cream">
                    {author
                      ? `${author.first_name} ${author.last_name}`
                      : "Participant"}
                  </p>
                  {author?.role_org && (
                    <p className="truncate text-xs text-cream/50">
                      {author.role_org}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-cream/35">
                  {timeAgo(post.created_at)}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-cream/90">
                {post.content}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => like(post)}
                  disabled={liked.has(post.id)}
                  className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-sm transition ${
                    liked.has(post.id)
                      ? "border-ember/60 bg-ember/15 text-ember"
                      : "border-white/10 text-cream/70 active:scale-95"
                  }`}
                >
                  <span>♥</span>
                  <span>{post.likes}</span>
                </button>
                {!isMine && author && (
                  <button
                    onClick={() =>
                      setTarget({
                        id: author.id,
                        name: author.first_name,
                      })
                    }
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-white/10 px-3 text-sm text-cream/70 active:scale-95"
                  >
                    Se connecter
                  </button>
                )}
              </div>
            </article>
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
    </div>
  );
}

function PromptBox({ prompt }: { prompt: string }) {
  return (
    <div className="rounded-2xl border border-ember/30 bg-marsala/40 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ember">
        Focus
      </p>
      <p className="mt-1 font-serif text-lg leading-snug text-cream">{prompt}</p>
    </div>
  );
}
