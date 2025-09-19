# Branch & Schema Stabilization Plan

Goal: preserve current functionality while eliminating schema drift between branches and local databases. Minimal code, clear checkpoints, reversible steps.

Version context: app version `1.6.0`, PostgreSQL via `pg` with custom SQL migrations under `db/migrations`, tracked in table `migrations` (see `src/scripts/migrate.ts`). Runtime code already uses `actual_duration` and `planned_duration`.

---

## Decision Gate

- If you intend to work on a feature branch, give it a branch-scoped dev DB name to avoid cross-contamination.
- If you intend to stay on `main`, ensure the local DB schema exactly matches migrations 001–005.

Command: `npm run db:status` (non-destructive)

- ✅ No pending / no extra → continue
- ⏳ Pending → `npm run db:migrate`
- ⚠️ Extra → your DB was migrated under another branch; use a branch-specific DB or reset dev data

---

## Branch‑Scoped Databases (Dev)

- Use separate DB names per branch in `.env.local`:
  - `DATABASE_NAME=lernplaner_main` for `main`
  - `DATABASE_NAME=lernplaner_feat` for `features/...`
- Keep the rest of the connection identical. This avoids accidental schema mixing.

---

## Safe Setup Flow (Main)

1) Inspect status

   - `npm run db:status`

2) Migrate (idempotent)

   - `npm run db:migrate`

3) Seed fresh dev data

   - `npm run db:seed`

4) Verify app integrity

   - `npm run type-check && npm run build`
   - `npm run dev` and smoke major flows

This keeps current runtime intact. No destructive operations are performed.

---

## Duration Model (Canonical)

- `learning_sessions`: `actual_duration` (minutes) + optional `planned_duration`
- `calendar_sessions`: `planned_duration` (required), `actual_duration` (optional)
- Migrations 004–005 already implement this. The old `duration` field is renamed (not computed/generated here).

Sanity checks (optional, read-only):

```sql
-- Are the expected columns present?
SELECT column_name FROM information_schema.columns
 WHERE table_name IN ('learning_sessions','calendar_sessions')
   AND column_name IN ('actual_duration','planned_duration')
 ORDER BY table_name, column_name;
```

---

## If You See Constraint Errors

- `chk_subjects_completed_positive` or `chk_events_type` indicate seed/data issues, not structural errors.
- Fix order of operations: seed → API validation → UI guards. Do not weaken DB constraints.
- Use fresh seed via `npm run db:setup` when switching branches.

---

## Reconciliation (When Merging Feature Branches)

- Prefer rebase to keep migration order linear. If merging creates timestamp clashes, normalize by renaming SQL files and reapplying in order.
- Always pass: `npm run type-check && npm run build && npm run db:setup && npm test` before merging.

---

## Quick Reference

- Status: `npm run db:status`
- Apply: `npm run db:migrate`
- Seed: `npm run db:seed`
- Full:  `npm run db:setup`

All commands are non-destructive to existing schemas except for `seed` data, which targets dev only.

