# Africa Circle

Web app live pour l'atelier **Africa Circle** — Renaissance Summit, hosted by Minah & Eastrise Group. Mobile-first, Next.js (App Router) + TypeScript + Tailwind + Supabase.

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # puis renseigner les valeurs Supabase
npm run dev
```

L'app se lance même sans Supabase configuré (elle affiche un message clair au lieu de crasher).

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** → coller/exécuter le contenu de [`supabase.sql`](./supabase.sql) (tables + RLS ouverte + Realtime).
3. **Settings → API** → copier l'URL et l'anon key dans `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Déploiement Vercel

1. Importer le repo GitHub dans Vercel.
2. Ajouter les deux variables d'env (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans **Project Settings → Environment Variables**.
3. Deploy. (Framework détecté : Next.js, aucune config particulière.)

## Parcours

- `/` — Landing
- `/onboarding` — mini-formulaire (crée la row `participants`, stocke l'`id` en localStorage)
- `/part1` — Building Trust (mur de contributions temps réel)
- `/part2` — How Do We Build Together? (mur + ressources)
- `/whats-next` — questionnaire de fin + remerciement
- `/group` — Le Groupe (participants + stats familiarité)
- `/connections` — Mes connexions (networking privé reçu/envoyé)

## À personnaliser

- Liens des ressources dans `src/app/part2/page.tsx` (placeholders `#`).
