# Tech Stack

This document outlines the core technologies used in this project.

---

## Frontend

### [Vite](https://vitejs.dev/)
- Modern build tool with fast HMR and optimized production builds
- Serves as the bundler and dev server for the project
- Configured with React for component development

### [shadcn/ui](https://ui.shadcn.com/)
- Collection of accessible, reusable React components built on Radix UI + Tailwind
- Components are copied into the codebase (not a dependency) for full customization
- Used across all UI: buttons, forms, modals, cards, tables, and navigation

### [Tailwind CSS](https://tailwindcss.com/)
- Utility-first CSS framework for rapid UI development
- Enables consistent design through a shared token system (spacing, colors, typography)
- Integrates via `@tailwindcss/vite` plugin

### [date-fns](https://date-fns.org/)
- Lightweight utility library for formatting, manipulating, and comparing dates
- Tree-shakeable — only import the functions you need

### [TanStack Query](https://tanstack.com/query) (`@tanstack/react-query`)
- Manages server state: fetching, caching, invalidation, and mutations
- Paired with `@tanstack/react-query-devtools` for cache inspection in development
- `QueryClient` configured in `src/lib/query-client.ts` (`staleTime: 60_000`, `gcTime: 300_000`, `retry: 1`)
- Query keys organized via factories in `src/lib/query-keys.ts` (`planKeys`, `quoteKeys`, `profileKeys`), hierarchical by entity → id → filters

---

## Backend & Database

### [Supabase](https://supabase.com/)
- Open-source Firebase alternative built on top of PostgreSQL
- Provides a managed relational database, authentication, storage, and real-time subscriptions
- Exposes RESTful and GraphQL API auto-generated from the database schema
- Used as the primary backend: database, auth, and file storage
- Typed client singleton in `src/lib/supabase/client.ts`, generated types in `src/types/supabase.ts`

---

## Application Architecture

Data flows through four layers, each with a single responsibility:

```
Supabase client  →  services  →  query hooks  →  components
```

| Layer | Location | Responsibility |
|-------|----------|-----------------|
| Client | `src/lib/supabase/client.ts` | Singleton typed Supabase client |
| Services | `src/services/*.ts` | Plain async functions per domain/table (`auth.ts`, `plans.ts`, `profiles.ts`, `quotes.ts`); call Supabase directly and throw on error |
| Query hooks | `src/hooks/queries/*.ts` | TanStack Query wrappers (`usePlans`, `useCustomerProfile`, `useQuotesByCustomer`, `useCreateQuote`, etc.) around services |
| Auth state | `src/contexts/auth-context.tsx` + `src/hooks/auth/use-auth.ts` | React Context populated from `supabase.auth.getSession()` and `onAuthStateChange`; exposes `session`, `user`, `loading`, `signIn`, `signUp`, `signOut` via `useAuth()` |
| Components | `src/components/**`, `src/App.tsx` | Consume query hooks and `useAuth()`; no direct Supabase calls |

`QueryClientProvider` and `AuthProvider` are wired at the root in `src/main.tsx`.

---

## Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Bundler | Vite | Dev server and build tool |
| Framework | React | Component-based UI |
| Components | shadcn/ui | Accessible UI components |
| Styling | Tailwind CSS | Utility-first styling |
| Date Utils | date-fns | Date formatting and manipulation |
| Server state | TanStack Query | Data fetching, caching, mutations |
| Backend | Supabase | Database, auth, and storage |

---

> This stack prioritizes performance, developer experience, and minimal infrastructure overhead.
