// Lightweight .env.local loader for TSX-run scripts
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function loadEnvFile(filename: string) {
  const file = join(process.cwd(), filename);
  if (!existsSync(file)) return;
  const text = readFileSync(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

// Load .env.local first; users can still override via real env
loadEnvFile('.env.local');

