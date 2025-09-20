#!/usr/bin/env tsx
// Invoke the calendar API GET to inspect payload without running Next server
import '../src/scripts/env';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../src/pages/api/calendar/index';

class Res implements Partial<NextApiResponse> {
  statusCode: number = 200;
  _json?: any;
  status(code: number) { this.statusCode = code; return this as any; }
  json(payload: any) { this._json = payload; console.log(JSON.stringify({ status: this.statusCode, count: Array.isArray(payload)? payload.length : undefined, sample: Array.isArray(payload)? payload.slice(0,5) : payload }, null, 2)); return this as any; }
  setHeader() {}
}

async function main() {
  const req = { method: 'GET', query: { month: '4', year: '2025' } } as unknown as NextApiRequest;
  const res = new Res() as NextApiResponse;
  await handler(req, res);
}

main().catch((e) => { console.error('calendar get failed', e); process.exit(1); });

