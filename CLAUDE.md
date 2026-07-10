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

**Document generation** — three libraries, by output type:
- `@react-pdf/renderer` — declarative PDF documents (e.g. amortization tables, cotización PDFs)
- `jspdf` + `jspdf-autotable` — imperative PDF in some reports
- `docx` — generates `.docx` files (see [src/features/creditos/word/](src/features/creditos/word/))

Dev-only image proxy: `vite.config.ts` proxies `/__img` → the backend, because it doesn't send CORS headers and `react-pdf`/`docx` fetch logos cross-origin to embed them. Use `/__img/...` (not the raw backend URL) when embedding backend images in generated PDFs/docs during local dev.

**Styling** — Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no separate `tailwind.config`). DaisyUI v5 for component classes (`btn`, `modal`, `modal-box`, etc.). Icons from `lucide-react` — prefer importing icons directly from `lucide-react` over hand-rolled SVG components; only hand-roll an inline SVG for brand marks lucide doesn't have (e.g. WhatsApp).

**Feature structure** — business logic lives in [src/features/](src/features/) grouped by domain (`creditos`, `cotizaciones`, `vehiculos`, `clientes`, …). Each domain folder holds table components, form components, and PDF/docx doc components, typically under a `components/` subfolder. Pages in [src/pages/](src/pages/) are thin wrappers that compose feature components — extract page-local markup (repeated cards, icons, small stateful widgets) into `src/features/<domain>/components/` rather than leaving it inline in the page.

**Services** — one file per domain in [src/services/](src/services/) (`creditosServices.ts`, `cotizacionesServices.ts`, `vehiculosServices.ts`, …), all built on the shared `api` axios instance ([src/services/axiosInstance.ts](src/services/axiosInstance.ts)). The response interceptor there logs the user out and reloads on `401`.

**Shared utilities:**
- [src/shared/components/FormInput.tsx](src/shared/components/FormInput.tsx) / [FormSelect.tsx](src/shared/components/FormSelect.tsx) — controlled inputs for `react-hook-form`
- [src/shared/components/CopyButton.tsx](src/shared/components/CopyButton.tsx) — self-contained "copy to clipboard" button (own `copied` state, no lifting needed)
- [src/utils/money.ts](src/utils/money.ts) — currency formatting
- [src/utils/date.ts](src/utils/date.ts) — date helpers (`fmtFecha`, `fmtFechaSolo`, `fmtHora`)
- [src/utils/files.ts](src/utils/files.ts) — `toAbsoluteUrl`/`toAbsoluteUrlOrUndefined` (backend-relative path → absolute URL) and `getFileExtension`; use these instead of re-deriving a base-URL/extension helper per page
- [src/utils/officeViewer.ts](src/utils/officeViewer.ts) — `getOfficeViewerUrl` wraps Office-format URLs (doc/docx/xlsx/pptx) with the Office Online viewer
- [src/utils/arrayMenu.ts](src/utils/arrayMenu.ts) — sidebar navigation config
