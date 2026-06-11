export function ConfigNotice() {
  return (
    <div className="card mx-auto my-6 max-w-md p-5 text-center">
      <p className="font-serif text-lg text-ember">Supabase not configured</p>
      <p className="mt-2 text-sm leading-relaxed text-cream/70">
        The app runs but can&apos;t load or save data. Set{" "}
        <code className="rounded bg-night px-1 text-ember">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        and{" "}
        <code className="rounded bg-night px-1 text-ember">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        in <code className="rounded bg-night px-1">.env.local</code>, then
        restart.
      </p>
    </div>
  );
}
