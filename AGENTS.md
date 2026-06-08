# AGENTS.md — Alianci Cleaning

This file orchestrates AI agents working on this project. Read it first before any task.

---

## Project Context

Alianci Cleaning — a cleaning services landing page with booking system, auth, and admin dashboard.

| Reference | Description |
|-----------|-------------|
| `.claude/docs/TECH_STACK.md` | Full tech stack (Vite, React, shadcn/ui, Tailwind, Supabase) |
| `.claude/docs/BUSINESS_LOGIC.md` | Complete business rules, entities, routes, and flows |

---

## Agent Rules

1. **Read AGENTS.md first** — always start here for project context.
2. **Consult docs** — read BUSINESS_LOGIC.md for domain rules, TECH_STACK.md for tech decisions.
3. **No comments** in code unless required by the language/framework.
4. **Follow existing patterns** — match naming, style, and conventions of surrounding code.
5. **No emojis** in code, commits, or documentation unless the user explicitly requests them.
6. **Git**: only commit when explicitly asked. No force push, no amend, no empty commits.

---

## Pending Work

- [ ] Set up Supabase project and schema (Users, Bookings, Plans tables)
- [ ] Implement authentication routes (`/login`, `/signup`)
- [ ] Build landing page hero, services/plans section, CTAs
- [ ] Build booking form (`/booking`)
- [ ] Build admin dashboard (`/dashboard`, `/dashboard/clients`, `/dashboard/plans`)
- [ ] Update site metadata (title, description)
- [ ] Deploy configuration (Vercel/Netlify)

---

## Commands

```sh
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
```

---

## Tech Decisions

- **date-fns** for date formatting (tree-shakeable, no moment.js)
- **Tailwind CSS v4** via `@tailwindcss/vite` — utility-first styling
- **shadcn/ui** for accessible, customizable React components
- **Supabase** as backend (database, auth, storage)
- **No internationalization** — single-language site
