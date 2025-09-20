// Apply pipeline (stub): idempotent upserts to calendar_sessions will be handled in API.
import { Diff } from './contracts';

export interface ApplyResult {
  added: number;
  removed: number;
  modified: number;
}

export async function applyChanges(_diff: Diff): Promise<ApplyResult> {
  // Intentionally minimal: integration will be implemented in API layer
  return {
    added: _diff.added.length,
    removed: _diff.removed.length,
    modified: _diff.modified.length,
  };
}

