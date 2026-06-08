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

---

## Backend & Database

### [Supabase](https://supabase.com/)
- Open-source Firebase alternative built on top of PostgreSQL
- Provides a managed relational database, authentication, storage, and real-time subscriptions
- Exposes RESTful and GraphQL API auto-generated from the database schema
- Used as the primary backend: database, auth, and file storage

---

## Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Bundler | Vite | Dev server and build tool |
| Framework | React | Component-based UI |
| Components | shadcn/ui | Accessible UI components |
| Styling | Tailwind CSS | Utility-first styling |
| Date Utils | date-fns | Date formatting and manipulation |
| Backend | Supabase | Database, auth, and storage |

---

> This stack prioritizes performance, developer experience, and minimal infrastructure overhead.
