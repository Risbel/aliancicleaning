# Project Structure — Alianci Cleaning

Folder layout and conventions, so implementations follow existing patterns without needing to search file by file.

---

## Layout

```
src/
├── assets/              Static images (hero.png, svg icons)
├── components/
│   ├── ui/              shadcn/ui primitives (button, card, avatar, dropdown-menu, carousel...)
│   ├── <feature>/       One folder per landing-page section (hero, navbar, footer, about, services, why-us, reviews)
│   └── decorative/      Purely visual, non-semantic components (FloatingBubble, WaveDivider)
├── contexts/            React context providers (auth-context.tsx)
├── data/                Static JSON content (services.json)
├── hooks/
│   ├── auth/            Auth-related hooks (use-auth.ts)
│   └── queries/         TanStack Query hooks, one per resource (use-plans.ts, use-profile.ts, use-quotes.ts)
├── lib/
│   ├── supabase/        Supabase client setup (client.ts)
│   ├── query-client.ts  TanStack Query client instance
│   ├── query-keys.ts    Centralized query key factory
│   └── utils.ts         Generic helpers (e.g. cn())
├── services/            Supabase data-access functions, one file per resource (auth.ts, plans.ts, profiles.ts, quotes.ts)
├── types/               Shared TypeScript types (supabase.ts — generated DB types)
├── App.tsx
├── main.tsx
└── index.css
```

---

## Conventions

- **Feature components**: each landing-page section gets its own folder under `src/components/`. Use `index.tsx` when the folder has a single main component (e.g. `footer/index.tsx`, `navbar/index.tsx`), or a named file when the folder has multiple related components (e.g. `services/index.tsx` + `services/ServiceCard.tsx`).
- **File naming**: kebab-case for non-component files (`use-auth.ts`, `auth-context.tsx`, `query-keys.ts`); PascalCase for component files (`HeroSection.tsx`, `ServiceCard.tsx`); lowercase for shadcn/ui primitives (`button.tsx`, `card.tsx`), matching shadcn's own convention.
- **Services layer** (`src/services/`): thin wrappers around Supabase calls, one file per resource/table. No business logic beyond the query itself — return `data`, throw on `error`.
- **Query hooks** (`src/hooks/queries/`): one hook file per resource, built on top of the matching `services/*.ts` file and `lib/query-keys.ts`. This is the only layer components should call for server data — never call `services/` directly from a component.
- **Query keys**: centralized in `lib/query-keys.ts`, not inlined in hooks.
- **Types**: `types/supabase.ts` is generated from the Supabase schema (see `.claude/docs/SCHEMA_CURRENT.md`) — do not hand-edit; regenerate instead.
- **Path alias**: `@/` maps to `src/` (see `vite.config.ts` / `tsconfig.json`).

---

## Where to add new things

| Adding a... | Goes in... |
|---|---|
| New landing-page section | `src/components/<section-name>/index.tsx` |
| New shadcn/ui primitive | `src/components/ui/` (via shadcn CLI) |
| New Supabase table integration | `src/services/<resource>.ts` + `src/hooks/queries/use-<resource>.ts` |
| New route/page | Not yet established — no router is set up yet (see Pending Work in `CLAUDE.md`) |
| New auth-related hook | `src/hooks/auth/` |
| New static content data | `src/data/` |
