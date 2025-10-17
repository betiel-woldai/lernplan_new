  ### **Short Version for Claude**

  When I edit db/terminplan.json:

  1. Update the JSON file
  2. Run: curl -X POST http://localhost:3000/api/cron/terminplan
  3. Verify DB: psql query to check calendar_sessions
  4. Hard refresh browser (Cmd+Shift+R)
  5. Test UI
  Remember: The database is the runtime source. JSON changes don't appear until
  re-imported.

  ---

  ### **Why This Matters**

  The key insight from our deep analysis:

  Flow: JSON (source) → Database (runtime) → API → Frontend

  Problem: Updating JSON ≠ Updating Database
  Solution: Explicit re-import step bridges the gap

  `★ Insight ─────────────────────────────────────`
  **The architecture has a manual sync step by design.** This isn't a bug - it's a
  feature that allows you to:
  - Preview changes before applying (dry-run mode)
  - Review diffs between old/new data
  - Rollback by not applying
  - Batch multiple edits before one import

  The trade-off is you **must remember to re-import** after editing the JSON. This is
  why automation (auto-sync on server start) or direct JSON reading (Option C) were
  alternatives - they eliminate this manual step, but lose the preview/control
  benefits.