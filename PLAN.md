# PLAN — Site CV « robinweb »

Site CV/portfolio bilingue FR/EN de Robin Bonhoure, déployé sur Vercel (robinweb.fr).
Design « light minimal suisse », hero 3D parallax, mini-jeu physique isolé, back-office `/admin` (CRUD).

## Stack (versions figées au scaffold — juin 2026)

- **Next.js 16.2.9** (App Router, Turbopack) + **React 19.2** + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (base color neutral, OKLCH)
- **Drizzle ORM** + **@neondatabase/serverless** (Neon Postgres)
- **Better Auth 1.6** (email/password, drizzle adapter)
- **next-intl 4.13** (routing `[locale]`, FR défaut / EN)
- **@vercel/blob** (upload images + PDF CV)
- **@react-three/fiber 9** + **drei** + **@react-three/rapier 2** + **three**
- **lenis** (smooth scroll) + **motion** (ex-Framer Motion)
- **react-hook-form** + **zod 4** + **@hookform/resolvers**
- **@dnd-kit/core + sortable + utilities** (réordonnancement)
- Gestionnaire de paquets : **pnpm** · Node 24

## Conventions (non négociables)

- **Lectures** : Drizzle directement dans les Server Components (site + listes admin).
- **Écritures** : Server Actions dans `src/lib/actions/`. Chaque action : (1) vérifie la session
  Better Auth, (2) valide via zod partagé, (3) `revalidatePath` admin + site public.
- **Formulaires admin** : shadcn + react-hook-form + zodResolver, même schéma zod client/serveur.
- **i18n** : contenu en colonnes `*_fr`/`*_en` ; textes d'UI dans `src/messages/{fr,en}.json`.
- Jeu 3D isolé dans `src/components/game/StackSkills/` derrière `<GameMount>` swappable.
- Respect strict de `prefers-reduced-motion` ; 3D lazy + fallback statique.

## Variables d'environnement

`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BLOB_READ_WRITE_TOKEN`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD` — voir `.env.example`.

---

## Phases

### Phase 0 — Scaffold & fondations ✅
- [x] create-next-app (TS, App Router, Tailwind v4, src, alias `@/*`, pnpm, Turbopack) → Next 16.2.9
- [x] Toutes les dépendances installées (builds natifs autorisés via `pnpm-workspace.yaml`)
- [x] shadcn configuré (components.json, lib/utils, globals.css OKLCH) + 17 composants UI
- [x] `.env.example` + `.env.local`
- [x] Build de contrôle OK (`pnpm build`)
- [ ] git init + commit initial

### Phase 1 — Drizzle + Neon
- [x] `src/db/index.ts` (client Neon serverless + drizzle)
- [x] `src/db/schema.ts` : experiences, educations, skills, projects, profile
- [x] `drizzle.config.ts` + scripts (generate / migrate / push / studio)
- [x] Migration générée (`drizzle/0000…`, `0001…`)
- [ ] ⏳ Migration appliquée sur Neon (nécessite `DATABASE_URL`)

### Phase 2 — Better Auth + seed admin
- [x] `src/lib/auth.ts` + `src/lib/auth-client.ts` (adapter drizzle)
- [x] Schéma tables auth (user, session, account, verification) généré via CLI
- [x] `src/app/api/auth/[...all]/route.ts`
- [x] Inscription publique désactivée (`disableSignUp: true`)
- [x] `src/db/seed.ts` — compte admin via env + helper `getSession()`/`requireSession()`
- [ ] Page login (construite avec la structure `/[locale]/admin` en Phase 4)
- [ ] ⏳ Seed admin exécuté (nécessite credentials)

### Phase 3 — Seed contenu (FR + EN générée)
- [x] `src/db/seed-content.ts` : profile + 5 expériences + 6 formations + skills (section 8)
- [x] Traduction EN initiale de chaque champ `*_en`
- [x] Projets vides (ajout via admin)
- [ ] ⏳ Seed exécuté sur Neon (nécessite credentials)

### Phase 4 — Admin CRUD
- [ ] Pattern de référence sur `experiences` (validator zod + actions + layout garde + liste + form + dnd)
- [ ] Dupliquer sur `educations`, `skills`, `projects`, `profile`

### Phase 5 — Upload Vercel Blob
- [ ] Server Action upload + composant réutilisable
- [ ] Branché : image projet, photo profil, PDF CV

### Phase 6 — Site public data-driven
- [ ] Sections Hero / Expériences / Formations / Stack / Compétences / Projets
- [ ] Page détail projet `/projets/[slug]`
- [ ] Bouton « Télécharger mon CV »

### Phase 7 — i18n next-intl complète
- [ ] routing.ts / request.ts / middleware + messages FR/EN
- [ ] Sélecteur de langue + métadonnées/OG par locale

### Phase 8 — Three.js
- [ ] Hero parallax (R3F, dynamic ssr:false, fallback)
- [ ] Jeu « Stack your skills » (Rapier, score=hauteur, reset, fallback mobile/reduced-motion)

### Phase 9 — Finition awwwards
- [ ] Lenis + apparitions scroll + micro-interactions
- [ ] Perf, responsive, prefers-reduced-motion, a11y
- [ ] SEO (sitemap, robots, OG par locale) + déploiement Vercel
