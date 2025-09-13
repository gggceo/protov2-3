import { NextResponse } from "next/server";
const API_BASE = process.env.API_BASE!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

// GET /api/listings → FastAPI /listings
export async function GET() {
  const r = await fetch(`${API_BASE}/listings`, {
    headers: { "x-admin-key": ADMIN_KEY },
    cache: "no-store",
  });
  const data = await r.json();
  return NextResponse.json({ ok: true, data });
}

// POST /api/listings → FastAPI /listings
export async function POST(req: Request) {
  const body = await req.json();
  const r = await fetch(`${API_BASE}/listings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-admin-key": ADMIN_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json({ ok: true, data });
}