#!/usr/bin/env tsx
// Invoke the terminplan API handler directly to apply changes without running Next server
import '../src/scripts/env';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../src/pages/api/cron/terminplan';

class Res implements Partial<NextApiResponse> {
  statusCode: number = 200;
  _json?: any;
  status(code: number) {
    this.statusCode = code;
    return this as any;
  }
  json(payload: any) {
    this._json = payload;
    console.log(JSON.stringify({ status: this.statusCode, payload }, null, 2));
    return this as any;
  }
  setHeader() { /* no-op */ }
} 

async function main() {
  const req = { method: 'POST' } as NextApiRequest;
  const res = new Res() as NextApiResponse;
  await handler(req, res);
}

main().catch((e) => { console.error('apply failed', e); process.exit(1); });

