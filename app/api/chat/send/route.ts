import { NextResponse } from "next/server";
const API_BASE = process.env.API_BASE!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

// POST /api/chat/send  →  backend: POST /chat/send
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // body 例: { roomId: string, message: string, ref?: string }

  const r = await fetch(`${API_BASE}/chat/send`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-admin-key": ADMIN_KEY,
    },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  let data: any; try { data = JSON.parse(text); } catch { data = text; }

  return NextResponse.json(
    data ?? { ok: false, error: "no response" },
    { status: r.status }
  );
}