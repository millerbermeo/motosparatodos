# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server at http://localhost:3000
npm run build      # tsc -b && vite build
npm run lint       # eslint
npm run preview    # preview production build
```

No test suite configured.

## Environment

Requires `VITE_API_URL` — the base URL for the PHP backend API. The axios instance in [src/services/axiosInstance.ts](src/services/axiosInstance.ts) reads it and injects the Bearer token from Zustand auth store on every request.

## Architecture

React 18 + TypeScript + Vite app (motorcycle dealership management system — "MotosParaTodos").

**Routing** — [src/config/AppRouter.tsx](src/config/AppRouter.tsx) uses `react-router-dom` v7 with lazy-loaded pages. All private routes are wrapped in `<PrivateRoute>` (checks `user` + `token` in Zustand), then further wrapped in `<RequireModule name="…">` which gates by the user's module list. Unauthorized → `/403`.

**Auth** — [src/store/auth.store.ts](src/store/auth.store.ts) (Zustand + `persist` → `localStorage`). Login response modules arrive as a string or malformed JSON from the backend; `normalizeModules()` repairs and deduplicates them. Module access check uses accent-insensitive comparison (`hasModuleNormalized` in [src/utils/permissions.ts](src/utils/permissions.ts)).

**Data fetching** — TanStack Query v5. Service files in [src/services/](src/services/) export `useQuery` / `useMutation` hooks. Pattern: query invalidates cache key on mutation success, calls `useModalStore().close()`, and fires a SweetAlert2 toast. Errors from the backend arrive as `{ message: string | string[] }` (see `ServerError` in [src/shared/types/server.ts](src/shared/types/server.ts)).

**Global modal** — `useModalStore` (Zustand, [src/store/modalStore.ts](src/store/modalStore.ts)) + `<GlobalModal>` rendered once in the layout. Open with `modalStore.open(content, title, { size, position })`. Form components are rendered as modal content and call `modalStore.close()` on success.

**Alerts** — `alert.success/error/warn/info` helpers in [src/utils/alerts.ts](src/utils/alerts.ts) wrap SweetAlert2. Service hooks also call `Swal.fire` directly in some cases.

**Wizard / multi-step forms** — `useWizardStore` ([src/store/wizardStore.ts](src/store/wizardStore.ts)) manages step index and prev/next/goTo. Used by credit registration flow.

**PDF generation** — two libraries in use:
- `@react-pdf/renderer` — declarative PDF documents (e.g. amortization tables, cotización PDFs)
- `jspdf` + `jspdf-autotable` — imperative PDF in some reports

**Styling** — Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no separate `tailwind.config`). DaisyUI v5 for component classes (`btn`, `modal`, `modal-box`, etc.). Icons from `lucide-react`.

**Feature structure** — business logic lives in [src/features/](src/features/) grouped by domain (`creditos`, `cotizaciones`, `vehiculos`, `clientes`, …). Each domain folder holds table components, form components, and PDF doc components. Pages in [src/pages/](src/pages/) are thin wrappers that compose feature components.

**Shared utilities:**
- [src/shared/components/FormInput.tsx](src/shared/components/FormInput.tsx) / [FormSelect.tsx](src/shared/components/FormSelect.tsx) — controlled inputs for `react-hook-form`
- [src/utils/money.ts](src/utils/money.ts) — currency formatting
- [src/utils/date.ts](src/utils/date.ts) — date helpers
- [src/utils/arrayMenu.ts](src/utils/arrayMenu.ts) — sidebar navigation config
