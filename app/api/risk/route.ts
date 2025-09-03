import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import YAML from 'yaml';

export async function GET() {
  const p = path.join(process.cwd(), 'ops', 'risk_rules.yaml');
  const src = fs.readFileSync(p, 'utf8');
  const doc = YAML.parse(src);
  return NextResponse.json({ ok: true, rules: doc });
}