# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Internal management system for "Tía Sarita", a chicken restaurant chain in Bolivia: admin back-office, cashier POS, and a staff portal. Next.js 16 (App Router) + React 19 + Supabase. UI text, identifiers, comments and commit messages are in Spanish (commits use `feat:` / `fix:` prefixes). Currency is Bolivianos (`Bs.`), locale `es-BO`.

## Commands

```bash
npm install          # git worktrees start without node_modules (also needed for node_modules/next/dist/docs)
npm run dev          # http://localhost:3000
npm run build
npm run lint         # eslint (next core-web-vitals + typescript)
npx eslint app/pos/PosClient.tsx   # lint one file
npx tsc --noEmit     # typecheck
```

There is no test suite.

Required env vars in `.env` (gitignored): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## Architecture

**No API layer — the browser talks to Supabase directly, and Postgres RLS is the authorization layer.** Client components read and write tables with the browser client (`lib/supabase/client.ts`); server components use `lib/supabase/server.ts` (cookie-based). Any permission change belongs in RLS policies, not in the UI. The service-role key is used in exactly one place: the `crearUsuarioAuth` server action in `app/admin/empleados/actions.ts` (creating Auth users).

**Auth gate:** `proxy.ts` (Next 16's replacement for `middleware.ts`) calls `updateSession` in `lib/supabase/middleware.ts`, which refreshes the session and redirects unauthenticated users to `/login`.

**Three areas, routed by `perfiles.rol`:**
- `/admin/*` — `admin`, `supervisor`
- `/pos` — `cajero` (admin/supervisor may also enter)
- `/portal` — operational staff: `mesero`, `cocinero`, `repartidor`, `limpieza`

The role → area redirect logic is duplicated in `app/page.tsx`, `app/login/page.tsx`, and each area's `layout.tsx`; change all of them together. The `RolUsuario` type in `lib/types/database.ts` only lists the original 3 roles — the operational roles were added later to the Postgres enum by `setup_roles.sql`.

**Page pattern:** `page.tsx` is an async server component (usually `export const dynamic = 'force-dynamic'`) that fetches with the server client and passes `initial*` props to a sibling `*Client.tsx` (`'use client'`), which holds state and performs mutations; create/edit forms are sibling `*Modal.tsx` files. Feedback via `react-hot-toast`, charts via `recharts`, icons via `lucide-react`.

**Business logic lives in Postgres triggers — do not recompute it in the app:**
- `ventas` insert/annul → updates turno totals per payment method (`actualizar_totales_turno`)
- `ventas` insert → assigns `numero_ticket`, sequential per sucursal and reset daily (`migration_numero_ticket_diario.sql`)
- `detalle_ventas` insert → deducts `insumos` stock via product recipes in `producto_insumos`; annulment returns it (`setup_inventario.sql`)
- `detalle_compras` insert → increases `insumos` stock
- new Auth user → creates `perfiles` row (`handle_new_user`); `perfiles.rol` enum is kept in sync with `rol_id` (RBAC tables `roles` / `permisos` / `usuario_permisos`)

**POS flow (`app/pos`):** with no open turno the page renders `AbrirTurno`; a unique index allows only one `abierto` turno per cajero (`migration_turno_unico_abierto.sql`), so query open turnos with `order + limit(1)`, not `.single()`. A sale inserts `ventas` then `detalle_ventas` (two separate client calls, not a transaction), then prints `TicketVenta` via `window.print()`. Opening/closing a turno also inserts into `notificaciones`.

**Realtime:** Supabase channels power `NotificacionesBell` (admin, `notificaciones` table) and `lib/hooks/useComunicados.ts` (POS bell + portal, `comunicados` table filtered by `roles_destino`).

**Styling:** Tailwind v4 is installed, but most UI uses the CSS variables and global classes in `app/globals.css` (dark theme; `--red`, `--yellow`, `--bg-*`, `--text-*`; `.btn`, `.input-field`, etc.) plus inline styles and per-component `<style>` blocks. Product images go to the public Supabase Storage bucket `productos`; `next.config.ts` whitelists `*.supabase.co` and `images.unsplash.com`.

## Database

There is no migration tool. SQL files are run by hand in the Supabase SQL Editor, in this order: `database/schema.sql` (tables, enums, triggers, RLS, views, seed), then the root `setup_roles.sql`, `setup_inventario.sql`, `setup_notificaciones.sql`, `setup_storage.sql`, then `database/migration_*.sql`. `database/seed-demo.sql` loads demo data; `database/SETUP.md` covers project creation and the first admin user.

For a schema change, add a new idempotent `database/migration_<name>.sql` and update `lib/types/database.ts` by hand (types are not generated). Reporting reads from `vista_*` views defined with `security_invoker = true`, so they respect RLS.
