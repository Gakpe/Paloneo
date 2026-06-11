export function ConfigNotice() {
  return (
    <div className="card mx-auto my-6 max-w-md p-5 text-center">
      <p className="font-serif text-lg text-ember">Supabase non configuré</p>
      <p className="mt-2 text-sm leading-relaxed text-cream/70">
        L&apos;app fonctionne mais ne peut ni charger ni enregistrer de données.
        Renseignez{" "}
        <code className="rounded bg-night px-1 text-ember">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        et{" "}
        <code className="rounded bg-night px-1 text-ember">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        dans <code className="rounded bg-night px-1">.env.local</code>, puis
        relancez.
      </p>
    </div>
  );
}
