# CLAUDE.md — Alianci Cleaning

This file is the primary context for Claude Code working on this project. Read it before any task.

---

## Project Context

**Alianci Cleaning** — a cleaning services landing page with booking system, authentication, and admin dashboard.

| Reference | Description |
|-----------|-------------|
| `.claude/docs/TECH_STACK.md` | Full tech stack (Vite, React, shadcn/ui, Tailwind, Supabase) |
| `.claude/docs/BUSINESS_LOGIC.md` | Complete business rules, entities, routes, and flows |
| `.claude/docs/STYLE_GUIDE.md` | Color palette, gradients, button variants, layout and component patterns |
| `.claude/docs/PROJECT_STRUCTURE.md` | Folder layout, naming conventions, and where to add new files |
| `.claude/docs/EMAIL_SENDING.md` | Quote confirmation email: Resend + edge function setup, secrets, go-live checklist |

---

## Rules

1. **No comments** in code unless required by the language/framework.
2. **Follow existing patterns** — match naming, style, and conventions of surrounding code.
3. **No emojis** in code, commits, or documentation unless the user explicitly requests them.
4. **Git**: only commit when explicitly asked. No force push, no amend, no empty commits.

---

## Commands

```sh
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
```

---

## Tech Decisions

- **Tailwind CSS v4** via `@tailwindcss/vite` — utility-first styling
- **shadcn/ui** for accessible, customizable React components
- **Supabase** as backend (database, auth, storage)
- **date-fns** for date formatting (tree-shakeable, no moment.js)
- **No internationalization** — single-language site

---

## Pending Work

- [ ] Set up Supabase project and schema (Users, Bookings, Plans tables)
- [ ] Implement authentication routes (`/login`, `/signup`)
- [ ] Build landing page hero, services/plans section, CTAs
- [ ] Build booking form (`/booking`)
- [ ] Build admin dashboard (`/dashboard`, `/dashboard/clients`, `/dashboard/plans`)
- [ ] Update site metadata (title, description)
- [ ] Deploy configuration (Vercel/Netlify)
