import { useEffect, useState } from 'react';

export default function TerminplanAdmin() {
  const [summary, setSummary] = useState<{ checksum: string; added: number; removed: number; modified: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<{ added: number; updated: number; removed: number } | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/cron/terminplan');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed');
        setSummary({ checksum: data.checksum, added: data.summary.added, removed: data.summary.removed, modified: data.summary.modified });
      } catch (e: any) {
        setError(e.message || 'Error');
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Terminplan — Dry Run</h1>
      {error && <div className="text-red-600">{error}</div>}
      {summary && (
        <div className="text-sm text-gray-700">
          <div>Checksum: <code>{summary.checksum}</code></div>
          <div>Added: {summary.added} · Modified: {summary.modified} · Removed: {summary.removed}</div>
        </div>
      )}
      <div className="pt-2">
        <button
          onClick={async () => {
            setApplying(true);
            setError(null);
            try {
              const res = await fetch('/api/cron/terminplan', { method: 'POST' });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || 'Apply failed');
              setApplyResult(data.applied);
            } catch (e: any) {
              setError(e.message || 'Apply failed');
            } finally {
              setApplying(false);
            }
          }}
          className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={applying}
        >
          {applying ? 'Wendet an…' : 'Änderungen anwenden'}
        </button>
      </div>
      {applyResult && (
        <div className="text-sm text-gray-700">
          <div>Applied: +{applyResult.added} · ~{applyResult.updated} · -{applyResult.removed}</div>
        </div>
      )}
      {!summary && !error && <div className="text-gray-500 text-sm">Loading…</div>}
    </div>
  );
}
